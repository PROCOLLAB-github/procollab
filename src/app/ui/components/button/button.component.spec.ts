/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { ButtonComponent } from "@ui/components";

describe("ButtonComponent", () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ButtonComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("should set the button type", () => {
    component.type = "submit";
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css("button")).nativeElement;
    expect(button.type).toEqual("submit");
  });

  it("should set the button color", () => {
    component.color = "red";
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css("button")).nativeElement;
    expect(button.classList).toContain("button--red");
  });

  it("should set the button appearance", () => {
    component.appearance = "outline";
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css("button")).nativeElement;
    expect(button.classList).toContain("button--outline");
  });

  it("should show the loader when loader input is true", () => {
    component.loader = true;
    fixture.detectChanges();

    const loader = fixture.debugElement.query(By.css("app-loader"));
    expect(loader).toBeTruthy();

    const content = fixture.debugElement.query(By.css("ng-content"));
    expect(content).toBeFalsy();
  });

  it("should show the content when loader input is false", () => {
    component.loader = false;
    fixture.detectChanges();

    let loader = fixture.debugElement.query(By.css("app-loader"));
    expect(loader).toBeFalsy();

    component.loader = true;
    fixture.detectChanges();

    loader = fixture.debugElement.query(By.css("app-loader"));
    expect(loader).toBeTruthy();
  });
});
