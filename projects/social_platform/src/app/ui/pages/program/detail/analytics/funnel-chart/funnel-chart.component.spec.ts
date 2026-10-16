/** @format */

import { TestBed } from "@angular/core/testing";
import { Chart } from "chart.js";
import { AnalyticsFunnelChartComponent } from "./funnel-chart.component";

vi.mock("chart.js", async importOriginal => {
  const actual = await importOriginal<typeof import("chart.js")>();
  return {
    ...actual,
    Chart: Object.assign(
      vi.fn(function (_canvas, config) {
        return {
          data: config.data,
          options: config.options,
          update: vi.fn(),
          destroy: vi.fn(),
          resize: vi.fn(),
        };
      }),
      { register: vi.fn() },
    ),
  };
});

describe("AnalyticsFunnelChartComponent", () => {
  beforeEach(() => {
    vi.mocked(Chart).mockClear();
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    TestBed.configureTestingModule({ imports: [AnalyticsFunnelChartComponent] });
  });

  const stage = (key: string, value: number | null) => ({
    key,
    label: key,
    value,
    tooltip: `Определение ${key}`,
  });

  async function render() {
    const fixture = TestBed.createComponent(AnalyticsFunnelChartComponent);
    fixture.componentRef.setInput("label", "Воронка участников");
    fixture.componentRef.setInput("items", [
      stage("Регистрация", 7),
      stage("Онбординг", 2),
      stage("Команда", 4),
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it("preserves stage order and actual nonmonotonic counts on a zero-based integer scale", async () => {
    const fixture = await render();
    const config = vi.mocked(Chart).mock.calls[0][1];
    expect(config.type).toBe("bar");
    expect(config.data.labels).toEqual(["Регистрация", "Онбординг", "Команда"]);
    expect(config.data.datasets[0].data).toEqual([7, 2, 4]);
    expect(config.options?.scales?.["y"]?.beginAtZero).toBe(true);
    expect(config.options?.scales?.["y"]?.ticks?.precision).toBe(0);
    const root = fixture.nativeElement as HTMLElement;
    expect([...root.querySelectorAll("tbody td")].map(td => td.textContent)).toEqual([
      "7",
      "2",
      "4",
    ]);
    expect(root.querySelector("canvas")?.getAttribute("aria-label")).toContain(
      "Воронка участников",
    );
    expect(root.querySelector("tbody th span")?.textContent).toBe("Определение Регистрация");
  });

  it("distinguishes unavailable metrics from genuine zero and reuses the chart on refresh", async () => {
    const fixture = await render();
    const chart = vi.mocked(Chart).mock.results[0].value;
    fixture.componentRef.setInput("items", [
      stage("Регистрация", 7),
      stage("Онбординг", null),
      stage("Команда", 0),
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(Chart).toHaveBeenCalledOnce();
    expect(chart.data.datasets[0].data).toEqual([7, null, 0]);
    const root = fixture.nativeElement as HTMLElement;
    expect([...root.querySelectorAll("tbody td")].map(td => td.textContent)).toEqual([
      "7",
      "Данные пока недоступны",
      "0",
    ]);
    expect(chart.update).toHaveBeenCalledOnce();
    fixture.destroy();
    expect(chart.destroy).toHaveBeenCalledOnce();
  });
});
