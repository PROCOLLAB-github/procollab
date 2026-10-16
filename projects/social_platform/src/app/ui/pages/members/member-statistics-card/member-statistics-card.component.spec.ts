/** @format */

import { TestBed } from "@angular/core/testing";
import { failure, loading, success } from "@domain/shared/async-state";
import { MemberStatisticsCardComponent } from "./member-statistics-card.component";

describe("Компактная статистика участников", () => {
  function card(state: ReturnType<typeof loading> | ReturnType<typeof success>) {
    const fixture = TestBed.createComponent(MemberStatisticsCardComponent);
    fixture.componentRef.setInput("state", state);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    return {
      fixture,
      root,
      values: () => Array.from(root.querySelectorAll("dd"), item => item.textContent!.trim()),
    };
  }

  it.each([loading(), failure("raw secret HTTP body")])(
    "показывает прочерки и безопасное доступное состояние: $status",
    state => {
      const { root, values } = card(state);
      expect(values()).toEqual(["—", "—", "—"]);
      expect(root.textContent).not.toContain("raw secret");
      expect(root.querySelector('[role="status"]')!.textContent).toContain(
        state.status === "failure" ? "Не удалось загрузить" : "Загрузка",
      );
      expect(root.querySelector("section")!.getAttribute("aria-busy")).toBe(
        String(state.status === "loading"),
      );
    },
  );

  it.each([0, 9, 63, 999, 1248, 12345, 12500, 999999])(
    "выводит три реальных значения %i, без процентов и лишних действий",
    value => {
      const { root, values } = card(
        success({ total: value, inProjects: value, inPrograms: value, newLast30Days: value }),
      );
      expect(values()).toEqual(Array(3).fill(new Intl.NumberFormat("ru-RU").format(value)));
      expect(Array.from(root.querySelectorAll("dt"), item => item.textContent!.trim())).toEqual([
        "Всего участников",
        "В проектах",
        "В программах",
      ]);
      expect(root.querySelectorAll("button, a")).toHaveLength(0);
      expect(root.textContent).not.toMatch(/скоро|Подробнее|эффективность|%/);
    },
  );

  it("обновляет данные в той же структуре карточки после loading и ошибки", () => {
    const { fixture, root, values } = card(loading());
    const section = root.querySelector("section");
    fixture.componentRef.setInput(
      "state",
      success({ total: 0, inProjects: 9, inPrograms: 63, newLast30Days: 999 }),
    );
    fixture.detectChanges();
    expect(values()).toEqual(["0", "9", "63"]);
    fixture.componentRef.setInput("state", failure("hidden"));
    fixture.detectChanges();
    expect(values()).toEqual(["—", "—", "—"]);
    expect(root.querySelector("section")).toBe(section);
  });
});
