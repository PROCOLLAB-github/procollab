/** @format */
import { TestBed } from "@angular/core/testing";
import { RegistrationField } from "@domain/program/program-registration.model";
import { RegistrationFieldsComponent, registrationControls } from "./registration-fields.component";
describe("Поля анкеты участника", () => {
  it("числовой ввод из DOM отправляет число, включая дробное значение", () => {
    const field: RegistrationField = {
      id: "f" + "a".repeat(32),
      type: "number",
      label: "Опыт",
      source: "own",
      helpText: "",
      options: [],
      allowOther: false,
      required: true,
    };
    const group = registrationControls([field]);
    TestBed.configureTestingModule({ imports: [RegistrationFieldsComponent] });
    const fixture = TestBed.createComponent(RegistrationFieldsComponent);
    fixture.componentRef.setInput("fields", [field]);
    fixture.componentRef.setInput("group", group);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;
    input.value = "2.5";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(group.getRawValue()[field.id]).toBe(2.5);
    input.value = "";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(group.invalid).toBe(true);
  });
});
