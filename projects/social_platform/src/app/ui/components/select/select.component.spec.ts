/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { SelectComponent } from "@ui/components";

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
    component.placeholder = placeholder;
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
    component.writeValue(selectedOption.id);
    component.options = options;
    fixture.detectChanges();
    const inputElement = fixture.nativeElement.querySelector(".field__input");
    expect(inputElement.textContent.trim()).toBe(selectedOption.label);
  });

  it("should update the selected option and emit a value when an option is clicked", () => {
    component.isOpen = true;
    const options = [
      { value: "option1", label: "Option 1", id: 1 },
      { value: "option2", label: "Option 2", id: 2 },
    ];
    const selectedOption = options[0];
    spyOn(component, "onChange");
    component.options = options;
    fixture.detectChanges();
    const optionElement = fixture.nativeElement.querySelector(".field__option");
    optionElement.click();
    expect(component.selectedId).toBe(selectedOption.id);
    expect(component.onChange).toHaveBeenCalledWith(selectedOption.value);
  });
});
