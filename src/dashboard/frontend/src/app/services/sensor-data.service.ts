import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Sensor, SensorReading, SensorResponse } from '../models/sensor.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SensorDataService implements OnDestroy {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;
  private wsUrl = `${environment.wsUrl}`;

  // Signals
  sensorsSignal = signal<Sensor[]>([]);
  loadingSignal = signal<boolean>(false);
  errorSignal = signal<string | null>(null);

  // WS state
  private selectedSensorSignal = signal<Sensor | null>(null);
  private liveReadingSignal = signal<SensorReading | null>(null);
  private wsConnectedSignal = signal<boolean>(false);
  private wsErrorSignal = signal<string | null>(null);
  private socket: WebSocket | null = null;

  // Readonly signals
  readonly sensors = this.sensorsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly selectedSensor = this.selectedSensorSignal.asReadonly();
  readonly liveReading = this.liveReadingSignal.asReadonly();
  readonly wsConnected = this.wsConnectedSignal.asReadonly();
  readonly wsError = this.wsErrorSignal.asReadonly();

  // Ottiene la lista dei sensori (recupero i sensori del tenant corrente basandomi sul token JWT nel backend)
  getSensors(): Observable<SensorResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<SensorResponse>(`${this.apiUrl}/sensors`).pipe(
      tap((response) => {
        this.sensorsSignal.set(response.sensors ?? []);
        this.loadingSignal.set(false);
      }),
      catchError((err) => {
        this.errorSignal.set('Failed to load sensors');
        this.loadingSignal.set(false);
        return of({ sensors: [] });
      }),
    );
  }

  // Gestione connessione con WS per ricevere dati streaming
  connectToSensor(sensor: Sensor): void {
    // Chiudi altre connessioni
    this.disconnect();

    this.selectedSensorSignal.set(sensor);
    this.wsErrorSignal.set(null);
    this.liveReadingSignal.set(null);

    // TODO: Aggiustare URL (immagino sia ws://.../sensors/sensor?id={id})
    const wsEndpoint = `${this.wsUrl}/sensors/sensor?id=${sensor.id}`;

    try {
      this.socket = new WebSocket(wsEndpoint);

      this.socket.onopen = () => {
        this.wsConnectedSignal.set(true);
      };

      this.socket.onmessage = (event) => {
        try {
          const reading: SensorReading = JSON.parse(event.data);
          this.liveReadingSignal.set(reading);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.wsErrorSignal.set('Connection error');
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.wsConnectedSignal.set(false);

        if (!event.wasClean) {
          this.wsErrorSignal.set('Connection lost');
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.wsErrorSignal.set('Failed to connect');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.wsConnectedSignal.set(false);
    this.wsErrorSignal.set(null);
    this.selectedSensorSignal.set(null);
    this.liveReadingSignal.set(null);
  }

  clearState(): void {
    this.sensorsSignal.set([]);
    this.loadingSignal.set(false);
    this.errorSignal.set(null);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
