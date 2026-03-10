/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SkillDetailComponent } from "./detail.component";

describe("SkillDetailComponent", () => {
  let component: SkillDetailComponent;
  let fixture: ComponentFixture<SkillDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SkillDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
