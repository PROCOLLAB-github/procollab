/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { TextareaComponent } from "./textarea.component";

describe("TextareaComponent", () => {
  let component: TextareaComponent;
  let fixture: ComponentFixture<TextareaComponent>;
  let onChangeSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, TextareaComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextareaComponent);
    component = fixture.componentInstance;
    onChangeSpy = spyOn(component, "onChange");
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should set value on input", () => {
    const inputEl = fixture.nativeElement.querySelector("textarea");
    inputEl.value = "test";
    inputEl.dispatchEvent(new Event("input"));
    expect(onChangeSpy).toHaveBeenCalledWith("test");
  });

  it("should set touched on blur", () => {
    spyOn(component, "onTouch");
    const inputEl = fixture.nativeElement.querySelector("textarea");
    inputEl.dispatchEvent(new Event("blur"));
    expect(component.onTouch).toHaveBeenCalled();
  });

  it("should disable input", () => {
    component.setDisabledState(true);
    fixture.detectChanges();
    const inputEl = fixture.nativeElement.querySelector("textarea");
    expect(inputEl.disabled).toBe(true);
  });

  it("should prevent enter", () => {
    const preventDefaultSpy = jasmine.createSpy("preventDefault");
    const event = { preventDefault: preventDefaultSpy } as any;
    component.preventEnter(event);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});
