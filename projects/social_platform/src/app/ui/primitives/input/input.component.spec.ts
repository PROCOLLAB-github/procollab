/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { InputComponent } from "@ui/primitives";
import { provideNgxMask } from "ngx-mask";

describe("InputComponent", () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, InputComponent],
      providers: [provideNgxMask()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("should set the value of the input element", () => {
    const fixture = TestBed.createComponent(InputComponent);
    fixture.componentRef.setInput("appValue", "test");
    fixture.detectChanges();
    const inputEl = fixture.nativeElement.querySelector("input");
    expect(inputEl.value).toBe("test");
  });

  it("should set the input type", () => {
    const input = fixture.nativeElement.querySelector("input");
    expect(input.type).toBe("text");
    fixture.componentRef.setInput("type", "email");
    fixture.detectChanges();
    expect(input.type).toBe("email");
  });

  it("should set the input placeholder", () => {
    const input = fixture.nativeElement.querySelector("input");
    expect(input.placeholder).toBe("");
    const testPlaceholder = "test placeholder";
    fixture.componentRef.setInput("placeholder", testPlaceholder);
    fixture.detectChanges();
    expect(input.placeholder).toBe(testPlaceholder);
  });

  it("passes autocomplete through to the native input", () => {
    fixture.componentRef.setInput("autocomplete", "current-password");
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector("input") as HTMLInputElement;
    expect(input.autocomplete).toBe("current-password");
  });

  it("should set the error class when error input is true", () => {
    const field = fixture.nativeElement.querySelector(".field");
    expect(field.classList).not.toContain("field--error");
    fixture.componentRef.setInput("error", true);
    fixture.detectChanges();
    expect(field.classList).toContain("field--error");
  });

  it("should emit the input value on input", () => {
    const emitSpy = vi.fn();
    component.appValue.subscribe(emitSpy);
    const testValue = "test";
    const input = fixture.nativeElement.querySelector("input");
    input.value = testValue;
    input.dispatchEvent(new Event("input"));
    expect(emitSpy).toHaveBeenCalledWith(testValue);
  });

  it("should emit enter event on enter keydown", () => {
    vi.spyOn(component.enter, "emit");
    const input = fixture.nativeElement.querySelector("input");
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(component.enter.emit).toHaveBeenCalled();
  });

  it("should call onChange function on input", () => {
    vi.spyOn(component, "onChange");
    const testValue = "test";
    const input = fixture.nativeElement.querySelector("input");
    input.value = testValue;
    input.dispatchEvent(new Event("input"));
    expect(component.onChange).toHaveBeenCalledWith(testValue);
  });

  it("should call onTouch function on blur", () => {
    vi.spyOn(component, "onTouch");
    const input = fixture.nativeElement.querySelector("input");
    input.dispatchEvent(new Event("blur"));
    expect(component.onTouch).toHaveBeenCalled();
  });

  it("should set the input type via setInput", () => {
    const input = fixture.nativeElement.querySelector("input");
    expect(input.type).toBe("text");
    fixture.componentRef.setInput("type", "email");
    fixture.detectChanges();
    expect(input.type).toBe("email");
  });

  it("should set the input placeholder via setInput", () => {
    const input = fixture.nativeElement.querySelector("input");
    expect(input.placeholder).toBe("");
    const testPlaceholder = "test placeholder";
    fixture.componentRef.setInput("placeholder", testPlaceholder);
    fixture.detectChanges();
    expect(input.placeholder).toBe(testPlaceholder);
  });

  it("should set the error class when error input is true via setInput", () => {
    const field = fixture.nativeElement.querySelector(".field");
    expect(field.classList).not.toContain("field--error");
    fixture.componentRef.setInput("error", true);
    fixture.detectChanges();
    expect(field.classList).toContain("field--error");
  });

  it("should format datepicker value as DD.MM.YYYY in text date mode", () => {
    const onChange = vi.fn();
    fixture.componentRef.setInput("type", "date");
    fixture.componentRef.setInput("dateInputMode", "text");
    component.registerOnChange(onChange);
    fixture.detectChanges();

    component.onDateChange({ value: new Date(1990, 2, 25) });

    expect(onChange).toHaveBeenCalledWith("25.03.1990");
    expect(component.appValue()).toBe("25.03.1990");
  });
});
