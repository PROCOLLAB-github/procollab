/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OnboardingStageOneComponent } from "./stage-one.component";

describe("StageOneComponent", () => {
  let component: OnboardingStageOneComponent;
  let fixture: ComponentFixture<OnboardingStageOneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OnboardingStageOneComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingStageOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
