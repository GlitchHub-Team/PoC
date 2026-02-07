import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';
import { HistoricDataResponse, Sensor, SensorReading } from '../models/sensor.model';
import { environment } from '../../environments/environment';

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
   * Recupera i dati storici di un sensore dal backend via HTTP.
   * I dati vengono salvati nel signal historicReadings, pronto
   * per essere utilizzato come dataset in un grafico Chart.js.
   * 
   * @param sensor - Sensore di cui recuperare lo storico
   * @param minutes - Finestra temporale in minuti (default: ultima ora)
   */
  getHistoricData(sensor: Sensor, minutes: number = 60): void {
    // Pulisce lo stato precedente
    this.clearAll();

    // Imposta il sensore selezionato e attiva lo stato di loading
    this.selectedSensorSignal.set(sensor);
    this.historicLoadingSignal.set(true);

    // Costruisce i query parameters per la richiesta
    const params = new HttpParams()
      .set('type', sensor.sensorType)   // Tipo sensore 
      .set('minutes', minutes.toString()); // Intervallo temporale richiesto

    // Effettua la chiamata GET al backend
    this.http.get<HistoricDataResponse>(`${this.apiUrl}/sensors/history`, { params })
      .pipe(
        tap((response) => {
          // Successo: popola il signal con le letture (o array vuoto se null)
          this.historicReadingsSignal.set(response.readings ?? []);
          this.historicLoadingSignal.set(false);
        }),
        catchError((err) => {
          // Errore: logga, imposta messaggio errore e disattiva loading
          console.error('Failed to load sensor historic data:', err);
          this.historicErrorSignal.set('Failed to load data');
          this.historicLoadingSignal.set(false);
          // Ritorna observable vuoto per non interrompere lo stream
          return of({ readings: [] });
        })
      )
      .subscribe();
  }

  /**
   * Stabilisce una connessione WebSocket per ricevere dati live da un sensore.
   * I dati vengono accumulati nel signal liveReadings con una sliding window,
   * permettendo al grafico Chart.js di aggiornarsi in tempo reale.
   * 
   * @param sensor - Sensore a cui connettersi per lo streaming
   */
  connectToSensor(sensor: Sensor): void {
    // Pulisce connessioni e dati precedenti prima di iniziare
    this.clearAll();

    // Imposta il sensore selezionato e inizializza il buffer vuoto
    this.selectedSensorSignal.set(sensor);
    this.liveReadingsSignal.set([]);

    // Costruisce l'URL WebSocket con l'ID del sensore come query parameter
    const wsEndpoint = `${this.wsUrl}/sensors/sensor?id=${sensor.id}`;

    try {
      this.socket = new WebSocket(wsEndpoint);

      // === EVENT HANDLERS WEBSOCKET ===

      this.socket.onopen = () => {
        this.wsConnectedSignal.set(true);
      };

      // Ricezione di un nuovo messaggio (lettura sensore)
      this.socket.onmessage = (event) => {
        try {
          // Parsing del JSON ricevuto dal server
          const reading: SensorReading = JSON.parse(event.data);
          // Aggiunge la lettura al buffer con gestione sliding window
          this.addReading(reading);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.wsErrorSignal.set('Connection error');
      };

      // Connessione chiusa
      this.socket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.wsConnectedSignal.set(false);

        // Se la chiusura non è stata pulita, segnala la perdita di connessione
        if (!event.wasClean) {
          this.wsErrorSignal.set('Connection lost');
        }
      };
    } catch (error) {
      // Errore nella creazione del WebSocket (es. URL malformato)
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