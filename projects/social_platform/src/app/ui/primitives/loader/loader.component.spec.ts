/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { LoaderComponent } from "./loader.component";

describe("LoaderComponent", () => {
  let component: LoaderComponent;
  let fixture: ComponentFixture<LoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoaderComponent],
    }).compileComponents();
  });

  it("should create", () => {
    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("should apply the speed input", () => {
    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("type", "wave");
    fixture.componentRef.setInput("speed", "2s");
    fixture.detectChanges();
    const dotWave = fixture.debugElement.query(By.css(".dot-wave")).nativeElement;
    expect(dotWave.style.getPropertyValue("--speed")).toBe("2s");
  });

  it("should apply the size input", () => {
    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("type", "wave");
    fixture.componentRef.setInput("size", "20px");
    fixture.detectChanges();
    const dotWave = fixture.debugElement.query(By.css(".dot-wave")).nativeElement;
    expect(dotWave.style.getPropertyValue("--size")).toBe("20px");
  });

  it("should apply the color input", () => {
    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("type", "wave");
    fixture.componentRef.setInput("color", "red");
    fixture.detectChanges();
    const dotWave = fixture.debugElement.query(By.css(".dot-wave")).nativeElement;
    expect(dotWave.style.getPropertyValue("--color")).toBe("var(--red)");
  });
});
