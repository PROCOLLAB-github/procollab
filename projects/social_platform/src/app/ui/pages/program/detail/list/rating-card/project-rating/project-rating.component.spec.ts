/** @format */
import { provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ProjectRatingComponent } from "./project-rating.component";
import { ProjectRatingCriterion } from "@domain/project/project-rating-criterion";

describe("Shared expert form lifecycle", () => {
  it("publishes zero and default No after replacing criteria, validates the new scale", async () => {
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
    expect(changed).toHaveBeenLastCalledWith({ 1: 0, 2: false });
    expect(component.form.invalid).toBe(true);
    component.form.get("1")?.setValue(1);
    expect(component.form.valid).toBe(true);
  });
});
