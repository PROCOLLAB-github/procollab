/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { RangeCriterionInputComponent } from "./range-criterion-input.component";

describe("RangeCriterionInputComponent", () => {
  let component: RangeCriterionInputComponent;
  let fixture: ComponentFixture<RangeCriterionInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, RangeCriterionInputComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RangeCriterionInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("should set the value of the input element", () => {
    const fixture = TestBed.createComponent(RangeCriterionInputComponent);
    const inputEl = fixture.nativeElement.querySelector("input");
    const component = fixture.componentInstance;
    component.value = 1;
    fixture.detectChanges();
    expect(inputEl.value).toBe("1");
  });

  it("should call onChange function on input", () => {
    spyOn(component, "onChange");
    const testValue = 1;
    const input = fixture.nativeElement.querySelector("input");
    input.value = testValue;
    input.dispatchEvent(new Event("input"));
    expect(component.onChange).toHaveBeenCalledWith(testValue);
  });

  it("should call onTouch function on blur", () => {
    spyOn(component, "onTouch");
    const input = fixture.nativeElement.querySelector("input");
    input.dispatchEvent(new Event("blur"));
    expect(component.onTouch).toHaveBeenCalled();
  });

  it("should set the error class when error input is true", () => {
    const field = fixture.nativeElement.querySelector(".field");
    expect(field.classList).not.toContain("field--error");
    component.error = true;
    fixture.detectChanges();
    expect(field.classList).toContain("field--error");
  });
});
