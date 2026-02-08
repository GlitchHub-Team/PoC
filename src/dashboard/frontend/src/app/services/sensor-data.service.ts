import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';
import { HistoricDataResponse, RawSensorReading, Sensor, SensorReading } from '../models/sensor.model';
import { Tenant } from '../models/tenant.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

/**
 * Servizio per la gestione dei dati dei sensori IoT.
 * 
 * Supporta due modalità di acquisizione dati:
 * 1. DATI STORICI: Recupero via HTTP GET di letture passate (ultimi N minuti)
 * 2. DATI LIVE: Streaming in tempo reale via WebSocket
 * 
 * I dati vengono esposti tramite Angular Signals, rendendoli perfettamente
 * compatibili con Chart.js: il componente grafico può sottoscriversi ai
 * signals e aggiornarsi automaticamente ad ogni nuova lettura.
 * 
 * Implementa OnDestroy per garantire la chiusura pulita delle connessioni WebSocket.
 */
@Injectable({
  providedIn: 'root',
})
export class SensorDataService implements OnDestroy {
  // Iniezione dipendenze
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  // URL delle API REST e WebSocket dalla configurazione environment
  private apiUrl = `${environment.apiUrl}`;
  private wsUrl = `${environment.wsUrl}`;

  // === CONFIGURAZIONE BUFFER DATI LIVE ===
  
  /**
   * Numero massimo di letture da mantenere in memoria per i dati live.
   * Implementa una "sliding window" per evitare consumo eccessivo di memoria
   * durante lo streaming prolungato. Con letture ogni secondo, 60 = 1 minuto di dati.
   * Questo valore determina anche quanti punti saranno visibili nel grafico live.
   */
  private readonly MAX_LIVE_READINGS = 60;

  // === SIGNALS - STATO WEBSOCKET (dati real-time) ===
  
  // Sensore attualmente selezionato per la visualizzazione
  private selectedSensorSignal = signal<Sensor | null>(null);
  // Buffer delle letture live ricevute via WebSocket
  private liveReadingsSignal = signal<SensorReading[]>([]); 
  // Stato della connessione WebSocket
  private wsConnectedSignal = signal<boolean>(false);
  // Eventuale errore WebSocket da mostrare all'utente
  private wsErrorSignal = signal<string | null>(null);
  // Riferimento all'istanza WebSocket per gestione connessione
  private socket: WebSocket | null = null;

  // === SIGNALS - STATO DATI STORICI (HTTP) ===
  
  // Array delle letture storiche recuperate dal backend
  private historicReadingsSignal = signal<SensorReading[]>([]);
  // Flag di caricamento per mostrare spinner/skeleton
  private historicLoadingSignal = signal<boolean>(false);
  // Eventuale errore nel caricamento dati storici
  private historicErrorSignal = signal<string | null>(null);

  // === COMPUTED SIGNALS ===
  
  /**
   * Estrae l'ultima lettura ricevuta dal buffer live.
   * Utile per visualizzare il valore corrente in tempo reale
   * insieme al grafico storico.
   */
  private latestReadingSignal = computed(() => {
    const readings = this.liveReadingsSignal();
    return readings.length > 0 ? readings[readings.length - 1] : null;
  });

  // === SIGNALS PUBBLICI IN SOLA LETTURA ===
  // Esposti ai componenti per binding reattivo e alimentazione grafici Chart.js
  
  readonly selectedSensor = this.selectedSensorSignal.asReadonly();
  // Array di letture per il dataset del grafico live
  readonly liveReadings = this.liveReadingsSignal.asReadonly();    
  // Ultimo valore per display in tempo reale
  readonly latestReading = this.latestReadingSignal;               
  // Stato connessione per indicatore visivo
  readonly wsConnected = this.wsConnectedSignal.asReadonly();
  readonly wsError = this.wsErrorSignal.asReadonly();
  // Array di letture per il dataset del grafico storico
  readonly historicReadings = this.historicReadingsSignal.asReadonly();
  readonly historicLoading = this.historicLoadingSignal.asReadonly();
  readonly historicError = this.historicErrorSignal.asReadonly();

  /**
   * Parse the subject string to extract tenant, gateway, and sensor type
   * Format: sensors.{tenant_id}.{gateway}.{sensor_type}
   */
  private parseSubject(subject: string): { tenant: string; gateway: string; sensorType: string } | null {
    const parts = subject.split('.');
    
    if (parts.length !== 4 || parts[0] !== 'sensors') {
      console.warn('Invalid subject format:', subject);
      return null;
    }

    return {
      tenant: parts[1],   
      gateway: parts[2],   
      sensorType: parts[3] 
    };
  }

  /**
   * Extract numeric value based on sensor type
   */
  private extractValue(data: any, sensorType: string): number {
    switch (sensorType) {
      case 'heart_rate':
        return data.bpm ?? 0;
      case 'blood_oxygen':
        return data.spO2 ?? 0;
      default:
        // Try to find any numeric value
        const numericValue = Object.values(data).find(v => typeof v === 'number');
        return (numericValue as number) ?? 0;
    }
  }

  /**
   * Parse the raw WebSocket message into a structured reading
   */
  private parseMessage(raw: RawSensorReading): SensorReading | null {
    const subjectInfo = this.parseSubject(raw.subject);
    if (!subjectInfo) return null;

    try {
      const data = JSON.parse(raw.data);
      const value = this.extractValue(data, subjectInfo.sensorType);

      return {
        tenant: subjectInfo.tenant,
        gateway: subjectInfo.gateway,
        sensorType: subjectInfo.sensorType,
        data: data,
        value: value,
        timestamp: new Date(raw.timestamp)
      };
    } catch (e) {
      console.error('Failed to parse message data:', e);
      return null;
    }
  }

  /**
   * Check if a reading matches the selected sensor type
   */
  private matchesSelectedSensor(reading: SensorReading): boolean {
    const selected = this.selectedSensorSignal();
    if (!selected) return false;

    return reading.sensorType === selected.sensorType;
  }

  /**
   * Build sensor-specific data object from metric
   */
  private buildSensorData(metric: HistoricDataResponse): any {
    switch (metric.metric) {
      case 'heart_rate':
        return { bpm: metric.value, timestamp: metric.timestamp };
      case 'blood_oxygen':
        return { spO2: metric.value, timestamp: metric.timestamp };
      default:
        return { value: metric.value, timestamp: metric.timestamp };
    }
  }

  /**
   * Transform backend HistoricMetric[] to ParsedSensorReading[]
   * This ensures consistency between live and historic data formats
   */
  private transformHistoricData(
    metrics: HistoricDataResponse[], 
    sensor: Sensor
  ): SensorReading[] {
    return metrics.map(metric => ({
      tenant: `tenant_${metric.tenantId}`,  // Reconstruct natsId format
      gateway: 'unknown',                      // Not available in historic data
      sensorType: metric.metric,
      data: this.buildSensorData(metric),
      value: metric.value,
      timestamp: new Date(metric.timestamp)
    }));
  }

  /**
   * Recupera dati storici dall'API
   * 
   * @param sensor - Sensore di cui vogliamo lo storico
   * @param minutes - Range temporale di interesse (default 60 minuti)
   * 
   * Calcolo numero letture: 1 lettura every 5 secondi = 12 letture al minuto
   */
  getHistoricData(sensor: Sensor, minutes: number = 60): void {
    // Pulisci lo stato interno
    this.clearAll();

    // Imposta i signals per dati storici
    this.selectedSensorSignal.set(sensor);
    this.historicLoadingSignal.set(true);
    this.historicErrorSignal.set(null);

    // Recupera tenant corrente
    const tenant = this.authService.userTenant();
    if (!tenant?.id) {
      console.error('No tenant ID available');
      this.historicErrorSignal.set('Tenant non configurato');
      this.historicLoadingSignal.set(false);
      return;
    }

    // Calcola il numero di punti da richiedere
    const readingsPerMinute = 12;
    const limit = minutes * readingsPerMinute;

    // Costruisci la query
    const params = new HttpParams()
      .set('tenant_id', tenant.id.toString())  
      .set('metric', sensor.sensorType)         
      .set('limit', limit.toString());          

    // Make GET request to backend
    this.http.get<HistoricDataResponse[]>(`${this.apiUrl}/history`, { params })
      .pipe(
        tap((response) => {
          // Transform backend response to ParsedSensorReading format
          const readings = this.transformHistoricData(response, sensor);
          this.historicReadingsSignal.set(readings);
          this.historicLoadingSignal.set(false);
        }),
        catchError((err) => {
          console.error('Failed to load sensor historic data:', err);
          this.historicErrorSignal.set(err);
          this.historicLoadingSignal.set(false);
          return of([]);
        })
      )
      .subscribe();
  }

  /**
   * Connect to WebSocket and filter for specific sensor
   */
  connectToSensor(sensor: Sensor): void {
    // Clean up previous connections and data
    this.clearAll();

    // Set selected sensor and initialize empty buffer
    this.selectedSensorSignal.set(sensor);
    this.liveReadingsSignal.set([]);

    // Get tenant natsId from auth service
    const tenant = this.authService.userTenant();
    if (!tenant?.natsId) {
      console.error('No tenant natsId available');
      this.wsErrorSignal.set('No tenant configured');
      return;
    }

    // Build WebSocket URL: ws://localhost:3000/ws/sensors/tenant_1
    const wsEndpoint = `${this.wsUrl}/ws/sensors/${tenant.natsId}`;
    console.log('Connecting to:', wsEndpoint);
    console.log('Filtering for sensor type:', sensor.sensorType);

    try {
      this.socket = new WebSocket(wsEndpoint);

      // === WEBSOCKET EVENT HANDLERS ===

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.wsConnectedSignal.set(true);
        this.wsErrorSignal.set(null);
      };

      // Receive new message (sensor reading)
      this.socket.onmessage = (event) => {
        try {
          // Parse raw JSON from server
          const raw: RawSensorReading = JSON.parse(event.data);
          
          // Parse into structured reading
          const parsed = this.parseMessage(raw);
          if (!parsed) {
            console.warn('Failed to parse message:', raw);
            return;
          }

          // Filter: only process messages for the selected sensor type
          if (this.matchesSelectedSensor(parsed)) {
            this.addReading(parsed);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.wsErrorSignal.set('Connection error');
      };

      // Connection closed
      this.socket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.wsConnectedSignal.set(false);

        // If closure was not clean, signal connection loss
        if (!event.wasClean) {
          this.wsErrorSignal.set('Connection lost');
        }
      };
    } catch (error) {
      // Error creating WebSocket (e.g., malformed URL)
      console.error('Failed to create WebSocket:', error);
      this.wsErrorSignal.set('Failed to connect');
    }
  }

  /**
   * Aggiunge una nuova lettura al buffer live implementando una sliding window.
   * Quando il buffer supera MAX_LIVE_READINGS, rimuove le letture più vecchie.
   * Questo garantisce un consumo di memoria costante durante streaming prolungati
   * e mantiene il grafico scorrevole con gli ultimi N valori.
   * 
   * @param reading - Nuova lettura da aggiungere al buffer
   */
  private addReading(reading: SensorReading): void {
    this.liveReadingsSignal.update(readings => {
      // Aggiunge la nuova lettura alla fine dell'array
      const updated = [...readings, reading];
      if (updated.length > this.MAX_LIVE_READINGS) {
        return updated.slice(-this.MAX_LIVE_READINGS);
      }
      return updated;
    });
  }

  /**
   * Disconnette il WebSocket e resetta lo stato relativo ai dati live.
   * Da chiamare quando si cambia sensore o si esce dalla vista live.
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.wsConnectedSignal.set(false);
    this.wsErrorSignal.set(null);
    this.selectedSensorSignal.set(null);
    this.liveReadingsSignal.set([]);
  }

  /**
   * Resetta completamente lo stato del servizio.
   * Chiamato prima di passare da modalità live a storica (e viceversa)
   * per garantire che non ci siano dati residui o connessioni aperte.
   */
  private clearAll(): void {
    this.disconnect();

    this.historicReadingsSignal.set([]);
    this.historicLoadingSignal.set(false);
    this.historicErrorSignal.set(null);
  }

  /**
   * Lifecycle hook di Angular: chiamato quando il servizio viene distrutto.
   * Garantisce la chiusura pulita delle connessioni WebSocket
   * per evitare memory leaks.
   */
  ngOnDestroy(): void {
    this.clearAll();
  }
}