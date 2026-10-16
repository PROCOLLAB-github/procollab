/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SkillsBasketComponent } from "./skills-basket.component";

describe("SkillsBasketComponent", () => {
  let component: SkillsBasketComponent;
  let fixture: ComponentFixture<SkillsBasketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsBasketComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillsBasketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
  it("удаление — именованная кнопка без submit, передающая изменение и touched", () => {
    const skill = {
      id: 9,
      name: "Управление конфликтами",
      category: { name: "Soft skills" },
    } as any;
    component.writeValue([skill]);
    const changed = vi.fn(),
      touched = vi.fn();
    component.registerOnChange(changed);
    component.registerOnTouched(touched);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
    expect(button).not.toBeNull();
    expect(button.type).toBe("button");
    expect(button.getAttribute("aria-label")).toBe("Удалить навык Управление конфликтами");
    button.click();
    expect(changed).toHaveBeenCalledExactlyOnceWith([]);
    expect(touched).toHaveBeenCalledTimes(1);
  });

  it("сброс формы удаляет ранее выбранные навыки", () => {
    component.writeValue([{ id: 9, name: "Angular" } as any]);
    component.writeValue(null as any);
    expect(component.value()).toEqual([]);
  });
  it("disabled CVA запрещает удаление и не уведомляет форму", () => {
    const skill = { id: 9, name: "Angular", category: { name: "Hard skills" } } as any;
    component.writeValue([skill]);
    component.setDisabledState(true);
    const changed = vi.fn();
    component.registerOnChange(changed);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
    expect(button.disabled).toBe(true);
    button.click();
    component.deleteSkill(9);
    expect(component.value()).toEqual([skill]);
    expect(changed).not.toHaveBeenCalled();
  });
});
