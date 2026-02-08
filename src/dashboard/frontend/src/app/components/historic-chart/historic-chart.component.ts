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

  // Configurazione del sensore richiesto
  @Input() sensor!: Sensor; 

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
  
  // Finestra di reading visibili al momento
  visibleReadings = computed(() => 
    this.readings.slice(this.position(), this.endIndex())
  );

  startTime = computed(() => this.formatTimestamp(this.readings[this.position()]?.timestamp));

  endTime = computed(() => this.formatTimestamp(this.readings[this.endIndex() - 1]?.timestamp));

  ngOnInit(): void {
    this.initChart();
  }

  // Se arrivano nuovi dati sposta la finestra alla fine
ngOnChanges(changes: SimpleChanges): void {
  if (changes['readings'] && this.readings.length > 0) {
    console.log('Nuovi dati ricevuti:', this.readings.length);
    console.log('maxPosition prima:', this.maxPosition());
    
    this.position.set(this.maxPosition());
    
    console.log('position dopo:', this.position());
    this.updateChart();
  }
}

  /**
   * Metodo che aiuta a formattare il timestamp del reading di un sensore 
   * nel formato a 24 ore.
   * @param timestamp: - il timestamp da convertire
   * @returns - un orario nel formato a 24 ore
   */
  private formatTimestamp(timestamp: string | Date | undefined): string {
    if (!timestamp) return '-';
    
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
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
          title: {
            display: true,
            text: 'Timestamp'
          },
          ticks: { maxTicksLimit: 6 }
        },
        y: {
          title: {
            display: true,
            text: this.sensor?.unit || 'Value'
          }
        }
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
        pointRadius: 2,
        pointBackgroundColor: '#3b82f6',
        tension: 0.2,
        fill: true,
      }]
    };

    this.chart?.update();
  }
}