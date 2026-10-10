/** @format */

import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  NgZone,
  signal,
  untracked,
  viewChildren,
} from "@angular/core";
import { ProgramAnalyticsActivityPoint } from "@domain/program/program-analytics.model";
import {
  CategoryScale,
  Chart,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  Plugin,
  PointElement,
  ScaleOptions,
  Tooltip,
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  Filler,
  CategoryScale,
  LinearScale,
  Tooltip,
);

@Component({
  selector: "app-analytics-activity-chart",
  templateUrl: "./activity-chart.component.html",
  styleUrl: "./activity-chart.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsActivityChartComponent {
  readonly points = input.required<readonly ProgramAnalyticsActivityPoint[]>();

  protected readonly series = [
    { key: "registrations", label: "Новые регистрации" },
    { key: "submittedSolutions", label: "Отправленные решения" },
  ] as const;
  protected readonly selectedDate = signal<string | null>(null);
  protected readonly selectedIndex = computed(() => {
    const index = this.points().findIndex(point => point.date === this.selectedDate());
    return index < 0 ? null : index;
  });
  protected readonly selectedPoint = computed(() => {
    const index = this.selectedIndex();
    return index === null ? null : this.points()[index];
  });
  protected readonly selectionLabel = computed(() => {
    const point = this.selectedPoint() ?? this.points()[0];
    return point
      ? `${this.dateLabel(point.date)}: новые регистрации — ${point.registrations}, отправленные решения — ${point.submittedSolutions}`
      : "Нет данных";
  });

  private readonly canvases = viewChildren<ElementRef<HTMLCanvasElement>>("canvas");
  private readonly zone = inject(NgZone);
  private readonly charts: Chart<"line", number[], string>[] = [];

  constructor() {
    afterRenderEffect(() => {
      const points = this.points();
      const canvases = this.canvases();
      this.zone.runOutsideAngular(() => {
        untracked(() =>
          canvases.forEach((canvas, index) =>
            this.renderChart(canvas.nativeElement, points, index),
          ),
        );
      });
    });
    afterRenderEffect(() => {
      const index = this.selectedIndex();
      this.zone.runOutsideAngular(() => {
        this.charts.forEach(chart => {
          chart.setActiveElements(index === null ? [] : [{ datasetIndex: 0, index }]);
          if (index === null) chart.tooltip?.setActiveElements([], { x: 0, y: 0 });
          chart.draw();
        });
      });
    });
    inject(DestroyRef).onDestroy(() => this.charts.forEach(chart => chart.destroy()));
  }

  protected dateLabel(date: string): string {
    const [, month, day] = date.slice(0, 10).split("-");
    return `${day}.${month}`;
  }

  protected selectFirstDate(): void {
    if (this.selectedIndex() === null) this.selectIndex(0);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const last = this.points().length - 1;
    if (last < 0) return;
    const current = this.selectedIndex() ?? 0;
    let next: number;
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowDown":
        next = Math.max(0, current - 1);
        break;
      case "ArrowRight":
      case "ArrowUp":
        next = Math.min(last, current + 1);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      case "Escape":
        event.preventDefault();
        this.selectedDate.set(null);
        return;
      default:
        return;
    }
    event.preventDefault();
    this.selectIndex(next);
  }

  private selectIndex(index: number): void {
    const point = this.points()[index];
    if (point) this.zone.run(() => this.selectedDate.set(point.date));
  }

  private renderChart(
    canvas: HTMLCanvasElement,
    points: readonly ProgramAnalyticsActivityPoint[],
    seriesIndex: number,
  ): void {
    const series = this.series[seriesIndex];
    const values = points.map(point => point[series.key]);
    const labels = points.map(point => this.dateLabel(point.date));
    const maximum = Math.max(
      1,
      ...points.flatMap(point => [point.registrations, point.submittedSolutions]),
    );
    const step = Math.max(1, Math.ceil(maximum / 4));
    const style = getComputedStyle(canvas);
    const color = style.getPropertyValue(seriesIndex === 0 ? "--accent" : "--green-dark").trim();
    const fill = style.getPropertyValue("--activity-series-fill").trim();
    const muted = style.getPropertyValue("--grey-for-text").trim();
    const grid = style.getPropertyValue("--medium-grey-for-outline").trim();
    const text = style.getPropertyValue("--black").trim();
    const surface = style.getPropertyValue("--light-white").trim();
    const font = { family: style.fontFamily, size: 11 };
    const existing = this.charts[seriesIndex];
    if (existing) {
      existing.data.labels = labels;
      existing.data.datasets[0].data = values;
      existing.data.datasets[0].pointRadius = points.length === 1 ? 3 : 0;
      const y = existing.options.scales!["y"] as ScaleOptions<"linear">;
      y.max = step * 4;
      y.ticks!.stepSize = step;
      existing.tooltip?.setActiveElements([], { x: 0, y: 0 });
      const selected = this.selectedIndex();
      existing.setActiveElements(selected === null ? [] : [{ datasetIndex: 0, index: selected }]);
      existing.update("none");
      return;
    }

    const guide: Plugin<"line"> = {
      id: "activity-date-guide",
      afterDatasetsDraw: chart => {
        const index = this.selectedIndex();
        if (index === null) return;
        const point = chart.getDatasetMeta(0).data[index];
        if (!point) return;
        const { ctx, chartArea } = chart;
        ctx.save();
        ctx.strokeStyle = grid;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(point.x, chartArea.top);
        ctx.lineTo(point.x, chartArea.bottom);
        ctx.stroke();
        ctx.restore();
      },
    };

    const chart = new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: series.label,
            data: values,
            borderColor: color,
            backgroundColor: fill,
            borderWidth: 2,
            fill: true,
            tension: 0,
            pointRadius: points.length === 1 ? 3 : 0,
            pointHoverRadius: 4,
            pointHoverBorderWidth: 2,
            pointHoverBorderColor: surface,
            pointHoverBackgroundColor: color,
            clip: false,
          },
        ],
      },
      plugins: [guide],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        layout: { padding: { top: 6, right: 8, left: 4 } },
        interaction: { mode: "index", intersect: false, axis: "x" },
        onHover: (_event, active) => {
          if (active.length) this.selectIndex(active[0].index);
        },
        onClick: (_event, active) => {
          if (active.length) this.selectIndex(active[0].index);
        },
        plugins: {
          tooltip: {
            backgroundColor: text,
            titleColor: surface,
            bodyColor: surface,
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            titleFont: font,
            bodyFont: font,
            callbacks: {
              title: contexts => this.dateLabel(this.points()[contexts[0].dataIndex].date),
            },
          },
        },
        scales: {
          x: {
            border: { display: false },
            grid: { display: false },
            ticks: {
              color: muted,
              font,
              autoSkip: false,
              maxRotation: 0,
              callback: (_value, index) => {
                const count = this.points().length;
                const interval = Math.max(1, Math.ceil((count - 1) / 3));
                return index % interval === 0 || index === count - 1
                  ? this.dateLabel(this.points()[index].date)
                  : "";
              },
            },
          },
          y: {
            type: "linear",
            min: 0,
            max: step * 4,
            border: { display: false },
            grid: { color: grid, drawTicks: false },
            ticks: { color: muted, stepSize: step, padding: 8, font },
            title: { display: true, text: "Событий", color: muted, font, align: "end" },
          },
        },
      },
    });
    this.charts[seriesIndex] = chart;
    document.fonts?.ready.then(() => {
      if (canvas.isConnected) {
        chart.resize();
        chart.update("none");
      }
    });
  }
}
