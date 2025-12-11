/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SkillsGroupComponent } from "./skills-group.component";

describe("SkillsGroupComponent", () => {
  let component: SkillsGroupComponent;
  let fixture: ComponentFixture<SkillsGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsGroupComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillsGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
