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

  it("сброс формы удаляет ранее выбранные навыки", () => {
    component.writeValue([{ id: 9, name: "Angular" } as any]);
    component.writeValue(null as any);
    expect(component.value()).toEqual([]);
  });
});
