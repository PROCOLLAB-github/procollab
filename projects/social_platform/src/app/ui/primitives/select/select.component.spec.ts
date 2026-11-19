/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { SelectComponent } from "@ui/primitives";

describe("SelectComponent", () => {
  let component: SelectComponent;
  let fixture: ComponentFixture<SelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, SelectComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("options", []);
    fixture.detectChanges();
  });

  it("forwards accessible names to the focusable combobox", () => {
    fixture.componentRef.setInput("aria-label", "Программа");
    fixture.detectChanges();
    const control: HTMLElement = fixture.nativeElement.querySelector("[role='combobox']");
    expect(control.getAttribute("aria-label")).toBe("Программа");
    fixture.componentRef.setInput("aria-label", null);
    fixture.componentRef.setInput("aria-labelledby", "program-label");
    fixture.detectChanges();
    expect(control.hasAttribute("aria-label")).toBe(false);
    expect(control.getAttribute("aria-labelledby")).toBe("program-label");
  });

  it("resolves a value written before asynchronous options arrive", () => {
    component.writeValue("7");
    fixture.detectChanges();
    fixture.componentRef.setInput("options", [{ id: 7, value: "7", label: "Программа семь" }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("[role='combobox']").textContent).toContain(
      "Программа семь",
    );
  });

  it("does not restore a pending value after the user selects another option", () => {
    component.writeValue("7");
    fixture.componentRef.setInput("options", [{ id: 8, value: "8", label: "Программа восемь" }]);
    fixture.detectChanges();
    component.onUpdate(8);
    fixture.componentRef.setInput("options", [
      { id: 7, value: "7", label: "Программа семь" },
      { id: 8, value: "8", label: "Программа восемь" },
    ]);
    fixture.detectChanges();
    expect(component.selectedId).toBe(8);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("does not open a disabled select by pointer or keyboard", () => {
    component.setDisabledState(true);
    fixture.detectChanges();
    const control: HTMLElement = fixture.nativeElement.querySelector(".field__input");
    control.click();
    control.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(component.isOpen).toBe(false);
    expect(control.getAttribute("tabindex")).toBe("-1");
  });

  it("opens the enabled select from its focused trigger", () => {
    const control: HTMLElement = fixture.nativeElement.querySelector(".field__input");
    control.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(component.isOpen).toBe(true);
    expect(component.highlightedIndex).toBe(0);
  });

  it("should display the placeholder text when no option is selected", () => {
    const placeholder = "Select an option";
    fixture.componentRef.setInput("placeholder", placeholder);
    fixture.detectChanges();
    const inputElement = fixture.nativeElement.querySelector(".field__input");
    expect(inputElement.textContent.trim()).toBe(placeholder);
  });

  it("should display the label of the selected option", () => {
    const options = [
      { value: "option1", label: "Option 1", id: 1 },
      { value: "option2", label: "Option 2", id: 2 },
    ];
    const selectedOption = options[1];
    fixture.componentRef.setInput("options", options);
    component.writeValue(selectedOption.id);
    fixture.detectChanges();
    const inputElement = fixture.nativeElement.querySelector(".field__input");
    expect(inputElement.textContent.trim()).toBe(selectedOption.label);
  });

  it("should update the selected option and emit a value when an option is clicked", () => {
    const options = [
      { value: "option1", label: "Option 1", id: 1 },
      { value: "option2", label: "Option 2", id: 2 },
    ];
    const selectedOption = options[0];
    vi.spyOn(component, "onChange");
    fixture.componentRef.setInput("options", options);
    component.isOpen = true;
    fixture.detectChanges();
    component.onUpdate(selectedOption.id);
    expect(component.selectedId).toBe(selectedOption.id);
    expect(component.onChange).toHaveBeenCalledWith(selectedOption.value);
  });

  it("renders its validation icon without a padded background wrapper", () => {
    fixture.componentRef.setInput("error", true);
    fixture.detectChanges();

    const control = fixture.nativeElement.querySelector(".field__input") as HTMLElement;
    const icon = control.querySelector(".field__error-icon") as HTMLElement;
    expect(icon.parentElement).toBe(control);
    expect(icon.classList).toContain("field__error-icon--bare");
  });
});
