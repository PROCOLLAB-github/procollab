/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { NumSliderComponent } from "./num-slider.component";

describe("NumSliderComponent", () => {
  let component: NumSliderComponent;
  let fixture: ComponentFixture<NumSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [NumSliderComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NumSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should set value to null when initialized", () => {
    expect(component.appValue).toBeNull();
  });

  it("should set disabled state", () => {
    component.setDisabledState(true);
    expect(component.disabled).toBeTrue();
  });

  it("should change value on move", () => {
    component.nums = [0, 1, 2, 3];
    component.appValue = 1;
    fixture.detectChanges();

    const rangeEl = fixture.nativeElement.querySelector(".num-slider__range");
    const rangeWidth = rangeEl.getBoundingClientRect().width;
    const moveEvent = new MouseEvent("mousemove", { clientX: rangeWidth / 2 });
    rangeEl.dispatchEvent(moveEvent);

    const pointEl = fixture.nativeElement.querySelector(".num-slider__button");
    const pressEvent = new MouseEvent("mousedown");
    pointEl.dispatchEvent(pressEvent);

    fixture.detectChanges();
    expect(component.appValue).toBe(1);
    expect(component.mousePressed).toBeTrue();
  });

  it("should emit appValueChange event on stop interaction", () => {
    spyOn(component.appValueChange, "emit");
    component.nums = [0, 1, 2, 3];
    component.appValue = 1;
    fixture.detectChanges();
    const buttonEl = fixture.nativeElement.querySelector(".num-slider__button");
    const event = new MouseEvent("mouseup");
    buttonEl.dispatchEvent(event);
    fixture.detectChanges();
    expect(component.mousePressed).toBeFalse();
    expect(component.appValueChange.emit).toHaveBeenCalled();
  });

  it("should set elements on setElements call", () => {
    component.nums = [0, 1, 2, 3];
    component.appValue = 1;
    fixture.detectChanges();
    component.setElements();
    fixture.detectChanges();

    expect(component.pointEl?.nativeElement.style.left).toEqual("33.3333%");
    expect(component.fillEl?.nativeElement.style.width).toEqual("33.3333%");
  });
});
