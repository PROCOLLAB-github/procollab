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

  beforeEach(() => {
    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should apply the speed input", () => {
    component.speed = "2s";
    fixture.detectChanges();
    const dotWave = fixture.debugElement.query(By.css(".dot-wave")).nativeElement;
    expect(dotWave.style.getPropertyValue("--speed")).toBe("2s");
  });

  it("should apply the size input", () => {
    component.size = "20px";
    fixture.detectChanges();
    const dotWave = fixture.debugElement.query(By.css(".dot-wave")).nativeElement;
    expect(dotWave.style.getPropertyValue("--size")).toBe("20px");
  });

  it("should apply the color input", () => {
    component.color = "red";
    fixture.detectChanges();
    const dotWave = fixture.debugElement.query(By.css(".dot-wave")).nativeElement;
    expect(dotWave.style.getPropertyValue("--color")).toBe("var(--red)");
  });
});
