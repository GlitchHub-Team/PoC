import { Component, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SensorDataService } from '../../services/sensor-data.service';
import { SensorChartComponent } from '../sensor-chart/sensor-chart.component';
import { Sensor } from '../../models/sensor.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SensorChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  // Services
  private authService = inject(AuthService);
  private sensorDataService = inject(SensorDataService);

  // Signal autenticazione
  protected currentUser = this.authService.currentUser;
  protected userName = this.authService.userName;
  protected userTenant = this.authService.userTenant;
  protected tenantName = this.authService.tenantName;

  // Sensors
  protected readonly sensorList: Sensor[] = [
    {
      id: 'heart_rate',
      name: 'Heart Rate Monitor',
      sensorType: 'heart_rate',
      unit: 'bpm'
    },
    {
      id: 'blood_oxygen',
      name: 'Blood Oxygen Sensor',
      sensorType: 'blood_oxygen',
      unit: '%'
    }
  ];

  // Sensore selezionato al momento
  protected selectedSensor = this.sensorDataService.selectedSensor;

  // Signal dati real time
  protected liveReadings = this.sensorDataService.liveReadings;
  protected latestReading = this.sensorDataService.latestReading;
  protected wsConnected = this.sensorDataService.wsConnected;
  protected wsError = this.sensorDataService.wsError;

  // Signals dati storici 
  protected historicReadings = this.sensorDataService.historicReadings;
  protected historicLoading = this.sensorDataService.historicLoading;
  protected historicError = this.sensorDataService.historicError;

  // Computed signals
  protected isLiveMode = computed(() => 
    this.wsConnected() || this.wsError() !== null || this.liveReadings().length > 0
  );

  protected isHistoricMode = computed(() =>
    !this.isLiveMode() && this.historicReadings().length > 0
  );

  protected hasData = computed(() =>
    this.liveReadings().length > 0 || this.historicReadings().length > 0
  );

  // Ultimo valore ricevuto + unità di misura
  protected latestValueDisplay = computed(() => {
    const reading = this.latestReading();
    const sensor = this.selectedSensor();
    if (!reading || !sensor) return null;

    return `${reading.value} ${sensor.unit}`;
  });

  // Signal per indicare lo stato della connessione
  protected connectionStatus = computed(() => {
    if (this.wsConnected()) return 'Live';
    if (this.wsError()) return 'Error';
    return 'Disconnected';
  });

  // Numero di letture accumulate
  protected readingsCount = computed(() => this.liveReadings().length);

  ngOnInit(): void {
    this.authService.refreshProfile().subscribe();
  }

  ngOnDestroy(): void {
    this.sensorDataService.disconnect();
  }

  onLiveClick(sensor: Sensor, event: Event): void {
    event.stopPropagation();
    this.sensorDataService.connectToSensor(sensor);
  }

  onHistoryClick(sensor: Sensor, event: Event): void {
    event.stopPropagation();
    this.sensorDataService.getHistoricData(sensor, 60);
  }

  closePanel(): void {
    this.sensorDataService.disconnect();
  }

  isSensorSelected(sensor: Sensor): boolean {
    return this.selectedSensor()?.id === sensor.id;
  }

  logout(): void {
    this.sensorDataService.disconnect();
    this.authService.logout();
  }
}