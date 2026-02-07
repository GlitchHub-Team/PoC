import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Sensor, SensorReading } from '../../models/sensor.model';

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Filler
} from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Filler
);

@Component({
  selector: 'app-sensor-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './sensor-chart.component.html',
  styleUrls: ['./sensor-chart.component.css'],
})
export class SensorChartComponent implements OnInit, OnChanges {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  @Input() sensor!: Sensor;
  @Input() readings: SensorReading[] = [];

  chartType: ChartType = 'line';
  chartData: ChartConfiguration['data'] = { datasets: [] };
  chartOptions: ChartConfiguration['options'] = {};

  ngOnInit(): void {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['readings'] || changes['sensor']) {
      this.updateChart();
    }
  }

  private initChart(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 200
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'second',
            displayFormats: {
              second: 'HH:mm:ss'
            }
          },
          title: {
            display: true,
            text: 'Time'
          }
        },
        y: {
          title: {
            display: true,
            text: this.sensor?.unit || 'Value'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (context) => `${context.parsed.y} ${this.sensor?.unit || ''}`
          }
        }
      }
    };

    this.updateChart();
  }

  private updateChart(): void {
    if (!this.readings || this.readings.length === 0) {
      this.chartData = { datasets: [] };
      this.chart?.update();
      return;
    }

    this.chartData = {
      datasets: [{
        data: this.readings.map(r => ({
          x: new Date(r.time).getTime(),
          y: r.value
        })),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#3b82f6'
      }]
    };

    this.chart?.update();
  }
}