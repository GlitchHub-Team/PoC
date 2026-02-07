import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Sensor, SensorResponse } from '../models/sensor.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SensorDataService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api`;

  // Signals
  sensorsSignal = signal<Sensor[]>([]);
  loadingSignal = signal<boolean>(false);
  errorSignal = signal<string | null>(null);

  // Readonly signals
  readonly sensors = this.sensorsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

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
      })
    );
  }

  clearState(): void {
    this.sensorsSignal.set([]);
    this.loadingSignal.set(false);
    this.errorSignal.set(null);
  }
}