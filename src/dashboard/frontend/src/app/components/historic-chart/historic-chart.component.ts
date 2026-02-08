import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { SensorReading } from '../../models/sensor.model';

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

// Da chart.js v3+ bisogna registrare le i moduli che si utilizzano
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
  selector: 'app-historic-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './historic-chart.component.html',
  styleUrls: ['./historic-chart.component.css'],
})
export class HistoricChartComponent implements OnInit, OnChanges {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  // Array delle letture e numero di punti visibili nel grafico
  @Input() readings: SensorReading[] = [];
  @Input() windowSize: number = 50;

  // Configurazione di base del chart
  chartType: ChartType = 'line';
  chartData: ChartConfiguration['data'] = { datasets: [] };
  chartOptions: ChartConfiguration['options'] = {};

  // Stato slider
  position = signal(0);

  // Computed signals
  maxPosition = computed(() => Math.max(0, this.readings.length - this.windowSize));
  endIndex = computed(() => Math.min(this.position() + this.windowSize, this.readings.length));
  
  visibleReadings = computed(() => 
    this.readings.slice(this.position(), this.endIndex())
  );

  startTime = computed(() => {
    const reading = this.readings[this.position()];
    return reading?.timestamp.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) ?? '-';
  });

  endTime = computed(() => {
    const reading = this.readings[this.endIndex() - 1];
    return reading?.timestamp.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) ?? '-';
  });

  ngOnInit(): void {
    this.initChart();
  }

  // Se arrivano nuovi dati sposta la finestra alla fine
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['readings'] && this.readings.length > 0) {
      this.position.set(this.maxPosition());
      this.updateChart();
    }
  }

  // Configurazione in dettaglio
  private initChart() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'minute',
            displayFormats: { minute: 'HH:mm' }
          },
          ticks: { maxTicksLimit: 6 }
        },
        y: {}
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (item) => `${item.parsed.y}`
          }
        }
      }
    };
  }

  // Ridisegna il grafico mentre quando si sposta lo slider
  onSliderChange(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    this.position.set(value);
    this.updateChart();
  }

  // Ridisegna i punti nel grafico
  private updateChart(): void {
    const visible = this.visibleReadings();
    
    if (visible.length === 0) {
      this.chartData = { datasets: [] };
      this.chart?.update();
      return;
    }

    this.chartData = {
      datasets: [{
        data: visible.map(r => ({
           x: r.timestamp.getTime(),
          y: r.value 
        })),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#3b82f6',
        tension: 0.2,
        fill: true,
      }]
    };

    this.chart?.update();
  }
}