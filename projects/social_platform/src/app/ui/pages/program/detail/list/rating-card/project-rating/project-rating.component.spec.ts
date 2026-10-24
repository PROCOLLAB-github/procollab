/** @format */
import { provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ProjectRatingComponent } from "./project-rating.component";
import { ProjectRatingCriterion } from "@domain/project/project-rating-criterion";

describe("Shared expert form lifecycle", () => {
  it("keeps answers and descriptions when switching between compact cards and full preview", async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectRatingComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProjectRatingComponent);
    const criterion: ProjectRatingCriterion = {
      id: 1,
      name: "Обоснованность решения",
      description: "Проверьте расчёты команды.",
      type: "int",
      minValue: 0,
      maxValue: 10,
      value: 0,
      expertId: 0,
    };
    fixture.componentRef.setInput("criteria", [
      criterion,
      { ...criterion, id: 2, name: "Соответствует кейсу", type: "bool", value: "false" },
      { ...criterion, id: 3, name: "Комментарий", type: "str", value: "Хорошее решение" },
    ]);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector(".rating--compact")).not.toBeNull();
    expect(root.querySelector("summary")?.textContent).toContain(criterion.name);
    expect(root.querySelector("details")?.textContent).toContain(criterion.description);
    expect(root.querySelector("details")?.open).toBe(false);
    expect(root.querySelector(".field__scale")?.textContent).toContain("/ 10");
    expect(root.querySelector("textarea")?.rows).toBe(2);
    const answers = fixture.componentInstance.form.getRawValue();
    expect(answers).toEqual({ 1: 0, 2: false, 3: "Хорошее решение" });

    fixture.componentRef.setInput("layout", "full");
    await fixture.whenStable();
    expect(root.querySelector(".rating--compact")).toBeNull();
    expect(root.querySelector("details")).toBeNull();
    expect(root.textContent).toContain(criterion.description);
    expect(root.textContent).toContain("Целые баллы");
    expect(root.querySelector("textarea")?.rows).toBe(6);
    expect(fixture.componentInstance.form.getRawValue()).toEqual(answers);
  });

  it("requires a deliberate boolean answer after criteria change and preserves zero", async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectRatingComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProjectRatingComponent);
    const component = fixture.componentInstance;
    const changed = vi.fn();
    component.registerOnChange(changed);
    const points: ProjectRatingCriterion = {
      id: 1,
      name: "Баллы",
      description: "",
      type: "int",
      minValue: 0,
      maxValue: 10,
      value: 0,
      expertId: 0,
    };
    fixture.componentRef.setInput("criteria", [points]);
    await fixture.whenStable();
    expect(changed).toHaveBeenLastCalledWith({ 1: 0 });
    component.writeValue({ 1: 0 });
    fixture.componentRef.setInput("criteria", [
      { ...points, minValue: 1 },
      { ...points, id: 2, name: "Новый", type: "bool", value: "" },
    ]);
    await fixture.whenStable();
    expect(changed).toHaveBeenLastCalledWith({ 1: 0, 2: null });
    expect(component.form.invalid).toBe(true);
    component.form.get("1")?.setValue(1);
    expect(component.form.invalid).toBe(true);
    component.chooseBoolean(2, false);
    expect(component.form.valid).toBe(true);
  });
});
