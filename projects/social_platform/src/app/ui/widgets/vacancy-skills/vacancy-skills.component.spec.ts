/** @format */

import { TestBed } from "@angular/core/testing";
import { VacancySkillsComponent } from "./vacancy-skills.component";
describe("VacancySkillsComponent", () => {
  it("показывает правильное число остальных навыков, раскрывает весь список и сворачивает его", () => {
    const fixture = TestBed.createComponent(VacancySkillsComponent);
    fixture.componentRef.setInput(
      "skills",
      Array.from({ length: 11 }, (_, id) => ({ id, name: "Навык " + id })),
    );
    fixture.componentRef.setInput("limit", 3);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll("app-tag")).toHaveLength(3);
    expect(element.textContent).toContain("Ещё +8");
    element.querySelector("button")!.click();
    fixture.detectChanges();
    expect(element.querySelectorAll("app-tag")).toHaveLength(11);
    expect(element.textContent).toContain("Навык 10");
    expect(element.querySelector("button")!.getAttribute("aria-expanded")).toBe("true");
    element.querySelector("button")!.click();
    fixture.detectChanges();
    expect(element.querySelectorAll("app-tag")).toHaveLength(3);
  });
  it("пустой список и один навык без категории не требуют раскрытия", () => {
    const fixture = TestBed.createComponent(VacancySkillsComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Навыки не указаны");
    fixture.componentRef.setInput("skills", [{ name: "CSS" }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("CSS");
    expect(fixture.nativeElement.querySelector("button")).toBeNull();
  });
});
