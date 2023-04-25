/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OnboardingStageTwoComponent } from "./stage-two.component";

describe("StageTwoComponent", () => {
  let component: OnboardingStageTwoComponent;
  let fixture: ComponentFixture<OnboardingStageTwoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OnboardingStageTwoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingStageTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
