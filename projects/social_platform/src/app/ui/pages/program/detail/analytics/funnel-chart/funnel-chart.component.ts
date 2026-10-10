/** @format */

import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  NgZone,
  viewChild,
} from "@angular/core";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
  Plugin,
  Tooltip,
} from "chart.js";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

export interface AnalyticsFunnelStage {
  key: string;
  label: string;
  /** null means the API has not supplied this metric, rather than zero people. */
  value: number | null;
  tooltip: string;
  axisLabel?: string[];
}

@Component({
  selector: "app-analytics-funnel-chart",
  templateUrl: "./funnel-chart.component.html",
  styleUrl: "./funnel-chart.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsFunnelChartComponent {
  readonly items = input.required<readonly AnalyticsFunnelStage[]>();
  readonly label = input.required<string>();
  readonly kind = input<"participants" | "projects">("participants");

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>("canvas");
  private readonly zone = inject(NgZone);
  private chart?: Chart<"bar", (number | null)[], string | string[]>;

  constructor() {
    afterRenderEffect(() => {
      const items = this.items();
      const kind = this.kind();
      this.zone.runOutsideAngular(() => this.renderChart(items, kind));
    });
    inject(DestroyRef).onDestroy(() => this.chart?.destroy());
  }

  private renderChart(items: readonly AnalyticsFunnelStage[], kind: string): void {
    const canvas = this.canvas().nativeElement;
    const style = getComputedStyle(canvas);
    const color = style.getPropertyValue(kind === "projects" ? "--green-dark" : "--accent").trim();
    const textColor = style.getPropertyValue("--black").trim();
    const mutedColor = style.getPropertyValue("--grey-for-text").trim();
    const gridColor = style.getPropertyValue("--medium-grey-for-outline").trim();
    const labels = items.map(item => item.axisLabel ?? item.label);
    const counts = items.map(item => item.value);
    const maximum = Math.max(1, ...counts.map(value => value ?? 0));

    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = counts;
      this.chart.data.datasets[0].backgroundColor = color;
      this.chart.data.datasets[0].hoverBackgroundColor = color;
      this.chart.options.scales!["y"]!.suggestedMax = maximum;
      this.chart.update();
      return;
    }

    const values: Plugin<"bar"> = {
      id: "funnel-values",
      afterDatasetsDraw: chart => {
        const { ctx } = chart;
        ctx.save();
        ctx.font = `600 14px ${style.fontFamily}`;
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        chart.getDatasetMeta(0).data.forEach((bar, index) => {
          const value = chart.data.datasets[0].data[index];
          const baseline = chart.scales["y"].getPixelForValue(0);
          const y = value == null ? baseline : bar.y;
          const x = chart.scales["x"].getPixelForValue(index);
          ctx.fillText(
            value == null ? "—" : new Intl.NumberFormat("ru-RU").format(Number(value)),
            x,
            y - 8,
          );
        });
        ctx.restore();
      },
    };

    this.chart = new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            data: counts,
            backgroundColor: color,
            hoverBackgroundColor: color,
            borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 0, bottomRight: 0 },
            borderSkipped: "bottom",
            maxBarThickness: 64,
            categoryPercentage: 0.68,
            barPercentage: 0.82,
          },
        ],
      },
      plugins: [values],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 350 },
        layout: { padding: { top: 28, right: 4 } },
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: textColor,
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            titleFont: { family: style.fontFamily },
            bodyFont: { family: style.fontFamily },
            callbacks: {
              title: contexts => this.items()[contexts[0].dataIndex].label,
              label: context => {
                const stage = this.items()[context.dataIndex];
                return stage.value == null ? "Данные пока недоступны" : `Всего: ${stage.value}`;
              },
            },
          },
        },
        scales: {
          x: {
            border: { display: false },
            grid: { display: false },
            ticks: {
              autoSkip: false,
              maxRotation: 0,
              minRotation: 0,
              padding: 12,
              color: textColor,
              font: { family: style.fontFamily, size: 11, lineHeight: 1.4 },
            },
          },
          y: {
            beginAtZero: true,
            suggestedMax: maximum,
            border: { display: false },
            grid: { color: gridColor, drawTicks: false },
            ticks: {
              precision: 0,
              maxTicksLimit: 5,
              padding: 8,
              color: mutedColor,
              font: { family: style.fontFamily, size: 10 },
            },
          },
        },
      },
    });
    document.fonts?.ready.then(() => {
      if (this.chart?.canvas?.isConnected) {
        this.chart.resize();
        this.chart.update("none");
      }
    });
  }
}
