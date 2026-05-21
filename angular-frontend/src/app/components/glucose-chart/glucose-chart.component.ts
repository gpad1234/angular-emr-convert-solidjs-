import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  ElementRef,
  ViewChild,
  SimpleChanges,
  AfterViewInit,
} from '@angular/core';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
  type TooltipItem,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(
  LineController, LineElement, PointElement, LinearScale,
  CategoryScale, Tooltip, Legend, Filler, annotationPlugin,
);

function classify(value: number): string {
  if (value < 70) return 'Low';
  if (value <= 180) return 'Target';
  return 'High';
}

@Component({
  selector: 'app-glucose-chart',
  standalone: true,
  template: `<canvas #canvas style="height:180px;"></canvas>`,
})
export class GlucoseChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() readings: any[] = [];
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['readings'] && this.canvasRef) {
      this.buildChart();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private buildChart(): void {
    if (!this.canvasRef) return;
    this.chart?.destroy();

    const readings = [...this.readings].reverse();

    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'line',
      data: {
        labels: readings.map(r => new Date(r.reading_datetime).toLocaleString()),
        datasets: [{
          label: 'Glucose (mg/dL)',
          data: readings.map(r => Math.round(r.value_mgdl)),
          borderColor: '#14b8a6',
          backgroundColor: 'rgba(20,184,166,0.08)',
          fill: true,
          tension: 0.25,
          pointRadius: 4,
          pointHoverRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: false } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items: TooltipItem<'line'>[]) => items?.[0]?.label ?? '',
              label: (ctx: TooltipItem<'line'>) => {
                const num = Number(ctx.formattedValue);
                return `${ctx.formattedValue} mg/dL - ${classify(num)}`;
              },
            },
          },
          // @ts-ignore – annotation plugin typings
          annotation: {
            annotations: {
              targetBand: {
                type: 'box', yMin: 70, yMax: 180,
                backgroundColor: 'rgba(34,197,94,0.06)', borderWidth: 0,
              },
              lowLine: {
                type: 'line', yMin: 70, yMax: 70,
                borderColor: 'rgba(59,130,246,0.6)', borderWidth: 1,
                label: { content: '70 mg/dL', display: true, position: 'start' },
              },
              highLine: {
                type: 'line', yMin: 180, yMax: 180,
                borderColor: 'rgba(244,63,94,0.6)', borderWidth: 1,
                label: { content: '180 mg/dL', display: true, position: 'start' },
              },
            },
          },
        },
      },
    } as any);
  }
}
