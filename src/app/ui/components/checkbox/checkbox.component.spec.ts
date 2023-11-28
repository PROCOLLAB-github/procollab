/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { CheckboxComponent } from "./checkbox.component";

describe("CheckboxComponent", () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [CheckboxComponent],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("should emit the checked value when the field is clicked", () => {
    spyOn(component.checkedChange, "emit");

    const field = fixture.debugElement.query(By.css(".field"));
    field.triggerEventHandler("click", null);

    expect(component.checkedChange.emit).toHaveBeenCalledWith(true);
  });

  it('should add the "field--checked" class when checked is true', () => {
    component.checked = true;
    fixture.detectChanges();

    const field = fixture.debugElement.query(By.css(".field"));
    expect(field.nativeElement.classList).toContain("field--checked");
  });

  it('should not add the "field--checked" class when checked is false', () => {
    component.checked = false;
    fixture.detectChanges();

    const field = fixture.debugElement.query(By.css(".field"));
    expect(field.nativeElement.classList).not.toContain("field--checked");
  });
});
