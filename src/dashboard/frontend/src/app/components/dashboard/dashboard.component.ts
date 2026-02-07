// components/dashboard/dashboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SensorDataService } from '../../services/sensor-data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // ============ SERVICES ============
  private authService = inject(AuthService);
  protected sensorService = inject(SensorDataService);

  // ============ AUTH SIGNALS ============
  protected currentUser = this.authService.currentUser;
  protected userName = this.authService.userName;
  protected userTenant = this.authService.userTenant;
  protected tenantName = this.authService.tenantName;

  // ============ SENSOR SIGNALS ============
  protected sensors = this.sensorService.sensors;
  protected sensorsLoading = this.sensorService.loading;
  protected sensorsError = this.sensorService.error;

  // ============ LIFECYCLE ============
  ngOnInit(): void {
    this.authService.refreshProfile().subscribe();
    this.loadSensors();
  }

  loadSensors(): void {
    this.sensorService.getSensors().subscribe();
  }

  logout(): void {
    this.authService.logout();
  }
}