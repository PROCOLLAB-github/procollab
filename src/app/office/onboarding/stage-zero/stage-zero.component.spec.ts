/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OnboardingStageZeroComponent } from "./stage-zero.component";

describe("StageOneComponent", () => {
  let component: OnboardingStageZeroComponent;
  let fixture: ComponentFixture<OnboardingStageZeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OnboardingStageZeroComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingStageZeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
