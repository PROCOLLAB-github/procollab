/** @format */

import { TestBed } from "@angular/core/testing";
import { Chart } from "chart.js";
import { AnalyticsActivityChartComponent } from "./activity-chart.component";

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
          draw: vi.fn(),
          destroy: vi.fn(),
          resize: vi.fn(),
          setActiveElements: vi.fn(),
        };
      }),
      { register: vi.fn() },
    ),
  };
});

describe("AnalyticsActivityChartComponent", () => {
  const points = [
    { date: "2026-08-01", registrations: 0, submittedSolutions: 1 },
    { date: "2026-08-02", registrations: 11, submittedSolutions: 2 },
    { date: "2026-08-03", registrations: 3, submittedSolutions: 0 },
  ];
  beforeEach(() => {
    vi.mocked(Chart).mockClear();
    TestBed.configureTestingModule({ imports: [AnalyticsActivityChartComponent] });
  });
  async function render() {
    const fixture = TestBed.createComponent(AnalyticsActivityChartComponent);
    fixture.componentRef.setInput("points", points);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }
  it("keeps exact daily counts in two filled charts with the same zero-based integer scale", async () => {
    const fixture = await render();
    const configs = vi.mocked(Chart).mock.calls.map(call => call[1]);
    expect(configs).toHaveLength(2);
    expect(configs.map(config => config.data.datasets[0].data)).toEqual([
      [0, 11, 3],
      [1, 2, 0],
    ]);
    configs.forEach(config => {
      expect(config.type).toBe("line");
      expect(config.data.labels).toEqual(["01.08", "02.08", "03.08"]);
      expect(config.options?.scales?.["y"]).toMatchObject({
        min: 0,
        max: 12,
        ticks: { stepSize: 3 },
      });
      expect(config.data.datasets[0]).toMatchObject({ fill: true, pointRadius: 0, tension: 0 });
    });
    expect(fixture.nativeElement.querySelectorAll('[role="slider"]')).toHaveLength(2);
  });
  it("synchronizes keyboard selection across both graphs and clamps at the date boundaries", async () => {
    const fixture = await render();
    const plots = fixture.nativeElement.querySelectorAll(
      '[role="slider"]',
    ) as NodeListOf<HTMLElement>;
    const key = async (value: string) => {
      plots[0].dispatchEvent(new KeyboardEvent("keydown", { key: value }));
      fixture.detectChanges();
      await fixture.whenStable();
    };
    plots[0].dispatchEvent(new FocusEvent("focus"));
    await key("ArrowRight");
    expect(plots[1].getAttribute("aria-valuetext")).toContain(
      "02.08: новые регистрации — 11, отправленные решения — 2",
    );
    vi.mocked(Chart).mock.results.forEach(result => {
      expect(result.value.setActiveElements).toHaveBeenLastCalledWith([
        { datasetIndex: 0, index: 1 },
      ]);
    });
    await key("End");
    await key("ArrowRight");
    expect(plots[1].getAttribute("aria-valuenow")).toBe("3");
    await key("Home");
    await key("ArrowLeft");
    expect(plots[1].getAttribute("aria-valuenow")).toBe("1");
    await key("Escape");
    expect(fixture.nativeElement.textContent).toContain("Наведите указатель");
    vi.mocked(Chart).mock.results.forEach(result =>
      expect(result.value.setActiveElements).toHaveBeenLastCalledWith([]),
    );
  });
  it("selects one date from pointer interaction and preserves it while live counts update", async () => {
    const fixture = await render();
    const config = vi.mocked(Chart).mock.calls[1][1];
    config.options!.onHover!(
      null as never,
      [{ datasetIndex: 0, index: 1 }] as never,
      null as never,
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector(".activity-chart__readout").textContent).toContain(
      "02.08",
    );
    fixture.componentRef.setInput(
      "points",
      points.map(point => ({ ...point, registrations: point.registrations + 1 })),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(Chart).toHaveBeenCalledTimes(2);
    expect(vi.mocked(Chart).mock.results[0].value.data.datasets[0].data).toEqual([1, 12, 4]);
    expect(
      fixture.nativeElement.querySelector('[role="slider"]').getAttribute("aria-valuetext"),
    ).toContain("регистрации — 12");
    fixture.destroy();
    vi.mocked(Chart).mock.results.forEach(result =>
      expect(result.value.destroy).toHaveBeenCalledOnce(),
    );
  });
  it("clears a removed date and keeps a single observation visible", async () => {
    const fixture = await render();
    const plot = fixture.nativeElement.querySelector('[role="slider"]') as HTMLElement;
    plot.dispatchEvent(new KeyboardEvent("keydown", { key: "End" }));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentRef.setInput("points", [points[0]]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain("Наведите указатель");
    expect(vi.mocked(Chart).mock.results[0].value.data.datasets[0].pointRadius).toBe(3);
    expect(plot.getAttribute("aria-valuemax")).toBe("1");
  });
});
