// pages/sensor-widget/sensor-widget.component.ts
import { Component, OnInit, OnDestroy, ViewChild, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import { SensorDataService } from '../../services/sensor-data.service';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-sensor-widget',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './sensor-widget.component.html',
  styleUrls: ['./sensor-widget.component.css']
})
export class SensorWidgetComponent implements OnInit, OnDestroy {

  // ============ SERVICES ============
  private route = inject(ActivatedRoute);
  protected sensorService = inject(SensorDataService);

  // ============ CHART ============
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  chartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Value',
      borderColor: '#3498db',
      backgroundColor: 'rgba(52, 152, 219, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 6
    }]
  };

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        display: true,
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6
        }
      },
      y: {
        beginAtZero: false
      }
    }
  };

  constructor() {
    // Effect: Update chart when data changes
    effect(() => {
      const labels = this.sensorService.chartLabels();
      const values = this.sensorService.chartValues();

      this.chartData.labels = labels;
      this.chartData.datasets[0].data = values;

      // Update chart without animation
      this.chart?.update('none');
    });

    // Effect: Update chart style when config loads
    effect(() => {
      const config = this.sensorService.currentConfig();
      if (config) {
        this.applyChartStyle(config.type);
      }
    });
  }

  // ============ LIFECYCLE ============

  ngOnInit(): void {
    // Get sensor ID from route and start streaming
    const sensorId = this.route.snapshot.paramMap.get('sensorId');

    if (sensorId) {
      this.sensorService.startStreaming(sensorId);
    }
  }

  ngOnDestroy(): void {
    this.sensorService.stopStreaming();
    this.sensorService.resetState();
  }

  // ============ METHODS ============

  /** Apply chart colors based on sensor type */
  private applyChartStyle(type: string): void {
    const styles: Record<string, { color: string; bg: string }> = {
      temperature: {
        color: '#e74c3c',
        bg: 'rgba(231, 76, 60, 0.1)'
      },
      humidity: {
        color: '#3498db',
        bg: 'rgba(52, 152, 219, 0.1)'
      },
      pressure: {
        color: '#9b59b6',
        bg: 'rgba(155, 89, 182, 0.1)'
      },
      light: {
        color: '#f1c40f',
        bg: 'rgba(241, 196, 15, 0.1)'
      }
    };

    const style = styles[type] || { color: '#3498db', bg: 'rgba(52, 152, 219, 0.1)' };

    this.chartData.datasets[0].borderColor = style.color;
    this.chartData.datasets[0].backgroundColor = style.bg;

    this.chart?.update('none');
  }
}