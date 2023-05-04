/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OnboardingStageTwoComponent } from "./stage-two.component";
import { of } from "rxjs";
import { AuthService } from "@auth/services";
import { RouterTestingModule } from "@angular/router/testing";

describe("StageTwoComponent", () => {
  let component: OnboardingStageTwoComponent;
  let fixture: ComponentFixture<OnboardingStageTwoComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj({
      saveProfile: of({}),
      setOnboardingStage: of({}),
    });

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [OnboardingStageTwoComponent],
      providers: [{ provide: AuthService, useValue: authSpy }],
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
