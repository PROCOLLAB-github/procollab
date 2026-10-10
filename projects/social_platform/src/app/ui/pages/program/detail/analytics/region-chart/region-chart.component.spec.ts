/** @format */

import { TestBed } from "@angular/core/testing";
import { Chart } from "chart.js";
import { AnalyticsRegionChartComponent, regionLabelLines } from "./region-chart.component";

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

describe("AnalyticsRegionChartComponent", () => {
  beforeEach(() => {
    vi.mocked(Chart).mockClear();
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    TestBed.configureTestingModule({ imports: [AnalyticsRegionChartComponent] });
  });

  async function render() {
    const fixture = TestBed.createComponent(AnalyticsRegionChartComponent);
    fixture.componentRef.setInput("label", "Регионы проектов");
    fixture.componentRef.setInput("items", [
      { name: "Набережные Челны", count: 2 },
      { name: "Москва", count: 12 },
      { name: "Без региона", count: 0 },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it("plots authoritative counts from zero in descending order with exact accessible values", async () => {
    const fixture = await render();
    const root = fixture.nativeElement as HTMLElement;
    expect([...root.querySelectorAll("tbody tr")].map(row => row.textContent)).toEqual([
      "Москва12",
      "Набережные Челны2",
      "Без региона0",
    ]);
    const config = vi.mocked(Chart).mock.calls[0][1];
    expect(config.type).toBe("bar");
    expect(config.data.datasets[0].data).toEqual([12, 2, 0]);
    expect(config.options?.indexAxis).toBe("y");
    expect(config.options?.scales?.["x"]?.beginAtZero).toBe(true);
    expect(config.options?.animation).toEqual({ duration: 0 });
    expect(root.querySelector("canvas")?.getAttribute("aria-label")).toContain("Регионы проектов");
  });

  it("updates an existing chart when counts change and destroys it on navigation", async () => {
    const fixture = await render();
    const chart = vi.mocked(Chart).mock.results[0].value;
    fixture.componentRef.setInput("items", [{ name: "Казань", count: 3 }]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(Chart).toHaveBeenCalledOnce();
    expect(chart.data.datasets[0].data).toEqual([3]);
    expect(chart.update).toHaveBeenCalledOnce();
    fixture.destroy();
    expect(chart.destroy).toHaveBeenCalledOnce();
  });

  it("keeps every region and its full name for long, scrollable distributions", async () => {
    const fixture = await render();
    const name = "Кабардино-Балкарская Республика";
    fixture.componentRef.setInput(
      "items",
      Array.from({ length: 40 }, (_, i) => ({ name: `${name} ${i}`, count: i })),
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll("tbody tr")).toHaveLength(40);
    expect(fixture.nativeElement.querySelector("tbody tr th").textContent).toBe(`${name} 39`);
    expect(regionLabelLines(name).join(" ")).toBe(name);
    const unbroken = "ОченьДлинноеНазваниеБезПробелов".repeat(3);
    expect(regionLabelLines(unbroken).join("")).toBe(unbroken);
    expect(regionLabelLines(unbroken).every(line => line.length <= 22)).toBe(true);
  });
});
