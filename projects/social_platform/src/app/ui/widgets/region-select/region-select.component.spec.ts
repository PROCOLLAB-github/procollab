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
    await TestBed.configureTestingModule({
      imports: [RegionSelectHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(RegionSelectHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const getInput = (): HTMLInputElement =>
    fixture.nativeElement.querySelector('[role="combobox"]') as HTMLInputElement;

  const typeQuery = (value: string): void => {
    const input = getInput();
    input.value = value;
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
  };

  it("keeps the project accessible name by default and accepts a user label", () => {
    expect(getInput().getAttribute("aria-label")).toBe("Регион проекта");
    const select = TestBed.createComponent(RegionSelectComponent);
    select.componentRef.setInput("ariaLabel", "Регион пользователя");
    select.detectChanges();

    expect(select.nativeElement.querySelector("input").getAttribute("aria-label")).toBe(
      "Регион пользователя",
    );
  });

  it("filters and selects a canonical region", () => {
    const input = getInput();
    input.dispatchEvent(new FocusEvent("focus"));
    typeQuery("татар");

    const option = fixture.debugElement.query(By.css('[role="option"] button'));
    expect(option.nativeElement.textContent.trim()).toBe("Республика Татарстан");

    option.nativeElement.click();
    fixture.detectChanges();

    expect(host.region.value).toBe("Республика Татарстан");
  });

  it("supports keyboard selection", () => {
    const input = getInput();
    input.dispatchEvent(new FocusEvent("focus"));
    typeQuery("моск");
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    fixture.detectChanges();

    expect(host.region.value).toBe("Москва");
  });

  it("clears a committed region while searching and commits only a selected replacement", () => {
    host.region.setValue("Москва");
    fixture.detectChanges();

    typeQuery("татар");

    expect(getInput().value).toBe("татар");
    expect(host.region.value).toBe("");

    const option = fixture.debugElement.query(By.css('[role="option"] button'));
    option.nativeElement.click();
    fixture.detectChanges();

    expect(getInput().value).toBe("Республика Татарстан");
    expect(host.region.value).toBe("Республика Татарстан");
  });

  it("clears a committed region when the input is manually emptied", () => {
    host.region.setValue("Москва");
    fixture.detectChanges();

    typeQuery("");

    expect(host.region.value).toBe("");
  });

  it("shows an unknown legacy value without replacing it", () => {
    host.region.setValue("Миксва");
    fixture.detectChanges();

    const input = getInput();
    input.dispatchEvent(new FocusEvent("focus"));
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(".region-select__legacy").textContent).toContain(
      "Текущее значение: Миксва",
    );
    expect(input.value).toBe("Миксва");
    expect(host.region.value).toBe("Миксва");
  });

  it("clears an unknown legacy value when replacement search starts", () => {
    host.region.setValue("Миксва");
    fixture.detectChanges();

    typeQuery("моск");

    expect(getInput().value).toBe("моск");
    expect(host.region.value).toBe("");
    expect(fixture.nativeElement.querySelector(".region-select__legacy")).toBeNull();
  });

  it("does not write arbitrary search text to the form", () => {
    const input = getInput();
    input.dispatchEvent(new FocusEvent("focus"));
    typeQuery("Новый случайный регион");

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

  it("orders Moscow before Moscow Oblast for a common prefix", () => {
    typeQuery("моск");

    const options = Array.from(
      fixture.nativeElement.querySelectorAll('[role="option"] button'),
      (option: Element) => option.textContent?.trim(),
    );

    expect(options.slice(0, 2)).toEqual(["Москва", "Московская область"]);
  });

  it("keeps deterministic results for a longer Moscow query", () => {
    typeQuery("Москов");

    const options = Array.from(
      fixture.nativeElement.querySelectorAll('[role="option"] button'),
      (option: Element) => option.textContent?.trim(),
    );

    expect(options).toEqual(["Московская область"]);
  });
});
