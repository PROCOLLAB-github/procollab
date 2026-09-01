/** @format */

import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { RegionSelectComponent } from "./region-select.component";

@Component({
  imports: [ReactiveFormsModule, RegionSelectComponent],
  template: `<app-region-select [formControl]="region"></app-region-select>`,
})
class RegionSelectHostComponent {
  readonly region = new FormControl("");
}

describe("RegionSelectComponent", () => {
  let fixture: ComponentFixture<RegionSelectHostComponent>;
  let host: RegionSelectHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RegionSelectHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(RegionSelectHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("filters and selects a canonical region", () => {
    const input = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent("focus"));
    input.value = "татар";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    const option = fixture.debugElement.query(By.css('[role="option"] button'));
    expect(option.nativeElement.textContent.trim()).toBe("Республика Татарстан");

    option.nativeElement.click();
    fixture.detectChanges();

    expect(host.region.value).toBe("Республика Татарстан");
  });

  it("supports keyboard selection", () => {
    const input = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent("focus"));
    input.value = "моск";
    input.dispatchEvent(new Event("input"));
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    fixture.detectChanges();

    expect(host.region.value).toBe("Московская область");
  });

  it("shows an unknown legacy value without replacing it", () => {
    host.region.setValue("Миксва");
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(".region-select__legacy").textContent).toContain(
      "Текущее значение: Миксва",
    );
    expect(host.region.value).toBe("Миксва");
  });

  it("does not write arbitrary search text to the form", () => {
    const input = fixture.nativeElement.querySelector('[role="combobox"]') as HTMLInputElement;
    input.dispatchEvent(new FocusEvent("focus"));
    input.value = "Новый случайный регион";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    expect(host.region.value).toBe("");
    expect(fixture.nativeElement.querySelector(".region-select__empty").textContent).toContain(
      "Ничего не найдено",
    );
  });

  it("clears the selected region", () => {
    host.region.setValue("Москва");
    fixture.detectChanges();

    (fixture.nativeElement.querySelector(".region-select__clear") as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(host.region.value).toBe("");
  });
});
