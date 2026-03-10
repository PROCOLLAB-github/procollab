/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfileSkillsRatingComponent } from "./skills-rating.component";

describe("ProfileSkillsRatingComponent", () => {
  let component: ProfileSkillsRatingComponent;
  let fixture: ComponentFixture<ProfileSkillsRatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileSkillsRatingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSkillsRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
