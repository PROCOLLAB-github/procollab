/** @format */

import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IconComponent } from "@ui/primitives";

// IconComponent — атрибутная директива-компонент ([appIcon]); componentRef.setInput
// к ней не применяется, поэтому тестируем через host с шаблонными биндингами.
@Component({
  standalone: true,
  imports: [IconComponent],
  template: `<i
    appIcon
    [icon]="icon"
    [appSquare]="appSquare"
    [appWidth]="appWidth"
    [appHeight]="appHeight"
  ></i>`,
})
class IconHostComponent {
  icon = "check";
  appSquare = "";
  appWidth = "";
  appHeight = "";
}

describe("IconComponent", () => {
  let fixture: ComponentFixture<IconHostComponent>;
  let host: IconHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IconHostComponent);
    host = fixture.componentInstance;
  });

  it("should create the icon component", () => {
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(IconComponent))).toBeTruthy();
  });

  it("should render the correct icon", () => {
    host.icon = "check";
    fixture.detectChanges();
    const useElement = fixture.debugElement.query(By.css("use")).nativeElement;
    expect(useElement.getAttribute("xlink:href")).toBe(
      "assets/icons/symbol/svg/sprite.css.svg#check",
    );
  });

  it("should set the width and height attributes if square is not set", () => {
    host.appWidth = "24";
    host.appHeight = "24";
    fixture.detectChanges();
    const svgElement = fixture.debugElement.query(By.css("svg")).nativeElement;
    expect(svgElement.getAttribute("width")).toBe("24");
    expect(svgElement.getAttribute("height")).toBe("24");
  });

  it("should set the viewBox attribute if square is set", () => {
    host.appSquare = "24";
    fixture.detectChanges();
    const svgElement = fixture.debugElement.query(By.css("svg")).nativeElement;
    expect(svgElement.getAttribute("viewBox")).toBe("0 0 24 24");
  });

  it("should update the viewBox attribute when square, width or height is set", () => {
    host.appSquare = "24";
    host.appWidth = "32";
    host.appHeight = "32";
    fixture.detectChanges();
    const svgElement = fixture.debugElement.query(By.css("svg")).nativeElement;
    expect(svgElement.getAttribute("viewBox")).toBe("0 0 24 24");
  });
});
