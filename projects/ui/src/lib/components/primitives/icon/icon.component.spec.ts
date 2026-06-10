/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IconComponent } from "./icon.component";

describe("IconComponent", () => {
  let component: IconComponent;
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("icon", "check"); // icon — required input
    fixture.detectChanges();
  });

  it("should create the icon component", () => {
    expect(component).toBeTruthy();
  });

  it("should render the correct icon", () => {
    fixture.componentRef.setInput("icon", "check");
    fixture.detectChanges();
    const useElement = fixture.debugElement.query(By.css("use")).nativeElement;
    expect(useElement.getAttribute("xlink:href")).toBe(
      "assets/icons/symbol/svg/sprite.css.svg#check",
    );
  });

  it("should set the width and height attributes if square is not set", () => {
    fixture.componentRef.setInput("appWidth", "24");
    fixture.componentRef.setInput("appHeight", "24");
    fixture.detectChanges();
    const svgElement = fixture.debugElement.query(By.css("svg")).nativeElement;
    expect(svgElement.getAttribute("width")).toBe("24");
    expect(svgElement.getAttribute("height")).toBe("24");
  });

  it("should set the viewBox attribute if square is set", () => {
    fixture.componentRef.setInput("appSquare", "24");
    fixture.detectChanges();
    const svgElement = fixture.debugElement.query(By.css("svg")).nativeElement;
    expect(svgElement.getAttribute("viewBox")).toBe("0 0 24 24");
  });

  it("should update the viewBox attribute when square, width or height is set", () => {
    fixture.componentRef.setInput("appSquare", "24");
    fixture.componentRef.setInput("appWidth", "32");
    fixture.componentRef.setInput("appHeight", "32");
    fixture.detectChanges();
    const svgElement = fixture.debugElement.query(By.css("svg")).nativeElement;
    expect(svgElement.getAttribute("viewBox")).toBe("0 0 24 24");
  });
});
