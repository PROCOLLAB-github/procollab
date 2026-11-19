/** @format */

import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { ExpertRosterComponent } from "./expert-roster.component";

describe("Список экспертов: состояния данных", () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [ExpertRosterComponent],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(ExpertRosterComponent);
    fixture.componentRef.setInput("rows", []);
    fixture.componentRef.setInput("selectedIds", new Set());
    fixture.componentRef.setInput("actions", () => []);
    return fixture;
  }

  it("не показывает пустое состояние, шапку и пагинацию во время загрузки", () => {
    const fixture = setup();
    fixture.componentRef.setInput("loading", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("table")).toBeNull();
    expect(fixture.nativeElement.querySelector(".experts__pagination")).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
  });

  it("после загрузки показывает только короткий текст без пустой шапки и 0–0", () => {
    const fixture = setup();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent.trim()).toBe(
      "Экспертов пока нет",
    );
    expect(fixture.nativeElement.querySelector("table")).toBeNull();
    expect(fixture.nativeElement.querySelector(".experts__pagination")).toBeNull();
  });

  it("показывает таблицу и реальный диапазон, когда эксперты загружены", () => {
    const fixture = setup();
    fixture.componentRef.setInput("rows", [
      { id: 1, name: "Эксперт", email: "expert@example.test", status: "joined" },
    ]);
    fixture.componentRef.setInput("total", 1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("table")).not.toBeNull();
    expect(fixture.nativeElement.querySelector(".experts__pagination").textContent).toContain(
      "1–1 из 1",
    );
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
  });
});
