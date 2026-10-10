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
  viewChild,
} from "@angular/core";
import { ProgramAnalyticsRegion } from "@domain/program/program-analytics.model";
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

/** Wrap full region names, including unbroken legacy values, without dropping text. */
export function regionLabelLines(
  name: string,
  fits = (line: string) => line.length <= 22,
): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of name.split(/\s+/)) {
    if (current && fits(current + " " + word)) {
      current += " " + word;
      continue;
    }
    if (current) lines.push(current);
    let remainder = word;
    while (remainder.length > 1 && !fits(remainder)) {
      let end = 1;
      while (end < remainder.length && fits(remainder.slice(0, end + 1))) end++;
      const hyphen = remainder.slice(0, end).lastIndexOf("-");
      if (hyphen > 0) end = hyphen + 1;
      lines.push(remainder.slice(0, end));
      remainder = remainder.slice(end);
    }
    current = remainder;
  }
  if (current) lines.push(current);
  return lines;
}

@Component({
  selector: "app-analytics-region-chart",
  templateUrl: "./region-chart.component.html",
  styleUrl: "./region-chart.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsRegionChartComponent {
  readonly items = input.required<readonly ProgramAnalyticsRegion[]>();
  readonly label = input.required<string>();
  readonly kind = input<"projects" | "participants">("projects");

  protected readonly sortedItems = computed(() =>
    [...this.items()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ru")),
  );
  protected readonly chartHeight = computed(() => {
    const rowHeight = Math.max(
      52,
      ...this.sortedItems().map(
        item => regionLabelLines(item.name, line => line.length <= 12).length * 15 + 16,
      ),
    );
    return Math.max(180, this.sortedItems().length * rowHeight + 36);
  });
  protected readonly unit = computed(() => (this.kind() === "projects" ? "Проекты" : "Участники"));
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>("canvas");
  private readonly zone = inject(NgZone);
  private chart?: Chart<"bar", number[], string | string[]>;

  constructor() {
    afterRenderEffect(() => {
      const items = this.sortedItems();
      const kind = this.kind();
      const unit = this.unit();
      this.zone.runOutsideAngular(() => this.renderChart(items, kind, unit));
    });
    inject(DestroyRef).onDestroy(() => this.chart?.destroy());
  }

  private renderChart(items: ProgramAnalyticsRegion[], kind: string, unit: string): void {
    const canvas = this.canvas().nativeElement;
    const style = getComputedStyle(canvas);
    const color = style.getPropertyValue(kind === "projects" ? "--accent" : "--green-dark").trim();
    const textColor = style.getPropertyValue("--black").trim();
    const mutedColor = style.getPropertyValue("--grey-for-text").trim();
    const gridColor = style.getPropertyValue("--medium-grey-for-outline").trim();
    const labels = items.map(item => item.name);
    const counts = items.map(item => item.count);
    const maximum = Math.max(1, ...counts);
    const valuePadding = Math.max(
      44,
      new Intl.NumberFormat("ru-RU").format(maximum).length * 8 + 16,
    );

    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = counts;
      this.chart.data.datasets[0].label = unit;
      this.chart.data.datasets[0].backgroundColor = color;
      this.chart.data.datasets[0].hoverBackgroundColor = color;
      this.chart.options.scales!["x"]!.suggestedMax = maximum;
      this.chart.options.layout!.padding = { left: 4, right: valuePadding, top: 6 };
      this.chart.update();
      return;
    }

    const values: Plugin<"bar"> = {
      id: "region-values",
      afterDatasetsDraw: chart => {
        const { ctx } = chart;
        ctx.save();
        ctx.font = `600 12px ${style.fontFamily}`;
        ctx.fillStyle = textColor;
        ctx.textBaseline = "middle";
        chart.getDatasetMeta(0).data.forEach((bar, index) => {
          const value = chart.data.datasets[0].data[index];
          ctx.fillText(new Intl.NumberFormat("ru-RU").format(Number(value)), bar.x + 8, bar.y);
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
            label: unit,
            data: counts,
            backgroundColor: color,
            borderRadius: 6,
            borderSkipped: false,
            barThickness: 18,
            hoverBackgroundColor: color,
          },
        ],
      },
      plugins: [values],
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 350 },
        layout: { padding: { left: 4, right: valuePadding, top: 6 } },
        interaction: { mode: "index", intersect: false },
        plugins: {
          tooltip: {
            backgroundColor: textColor,
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            titleFont: { family: style.fontFamily },
            bodyFont: { family: style.fontFamily },
            callbacks: {
              title: contexts => this.sortedItems()[contexts[0].dataIndex].name,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            suggestedMax: maximum,
            border: { display: false },
            grid: { color: gridColor, drawTicks: false },
            ticks: {
              precision: 0,
              maxTicksLimit: 4,
              color: mutedColor,
              padding: 10,
              font: { family: style.fontFamily, size: 10 },
            },
          },
          y: {
            border: { display: false },
            grid: { display: false },
            // Font loading can change measurements cached by Chart.js. Fit the
            // label column to the rendered font, including every wrapped line.
            afterFit: scale => {
              const ctx = scale.chart.ctx;
              ctx.save();
              ctx.font = `11px ${style.fontFamily}`;
              const widths = scale.ticks.flatMap(tick => {
                const lines = Array.isArray(tick.label) ? tick.label : [tick.label];
                return lines.map(line => ctx.measureText(String(line)).width);
              });
              ctx.restore();
              scale.width = Math.ceil(Math.max(0, ...widths)) + 24;
            },
            ticks: {
              autoSkip: false,
              callback: function (value) {
                const ctx = this.chart.ctx;
                ctx.save();
                ctx.font = `11px ${style.fontFamily}`;
                const width = Math.max(60, Math.min(145, this.chart.width * 0.42 - 16));
                const lines = regionLabelLines(
                  this.getLabelForValue(Number(value)),
                  line => ctx.measureText(line).width <= width,
                );
                ctx.restore();
                return lines;
              },
              color: textColor,
              padding: 10,
              font: { family: style.fontFamily, size: 11, lineHeight: 1.35 },
            },
          },
        },
      },
    });
    // Recalculate text widths once the site's font has loaded.
    document.fonts?.ready.then(() => {
      if (this.chart?.canvas?.isConnected) {
        this.chart.resize();
        this.chart.update("none");
      }
    });
  }
}
