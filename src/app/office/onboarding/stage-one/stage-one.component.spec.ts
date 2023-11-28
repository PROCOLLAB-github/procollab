/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OnboardingStageOneComponent } from "./stage-one.component";
import { of } from "rxjs";
import { ReactiveFormsModule } from "@angular/forms";
import { AuthService } from "@auth/services";
import { RouterTestingModule } from "@angular/router/testing";
import { NgxMaskModule } from "ngx-mask";

describe("StageOneComponent", () => {
  let component: OnboardingStageOneComponent;
  let fixture: ComponentFixture<OnboardingStageOneComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
      saveProfile: of({}),
      setOnboardingStage: of({}),
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        NgxMaskModule.forRoot(),
        OnboardingStageOneComponent,
      ],
      providers: [{ provide: AuthService, useValue: authSpy }],
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
