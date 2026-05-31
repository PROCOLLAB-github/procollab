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
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
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
    spyOn(component, "onChange");
    fixture.componentRef.setInput("options", options);
    component.isOpen = true;
    fixture.detectChanges();
    component.onUpdate(selectedOption.id);
    expect(component.selectedId).toBe(selectedOption.id);
    expect(component.onChange).toHaveBeenCalledWith(selectedOption.value);
  });
});
