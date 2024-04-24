/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SkillsBlockComponent } from "./skills-block.component";

describe("SkillsBlockComponent", () => {
  let component: SkillsBlockComponent;
  let fixture: ComponentFixture<SkillsBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SkillsBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
