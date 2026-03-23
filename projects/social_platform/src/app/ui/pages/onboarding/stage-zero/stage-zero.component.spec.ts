/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OnboardingStageZeroComponent } from "./stage-zero.component";
import { of } from "rxjs";
import { AuthRepository } from "projects/social_platform/src/app/infrastructure/repository/auth/auth.repository";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { NgxMaskModule } from "ngx-mask";

describe("StageZeroComponent", () => {
  let component: OnboardingStageZeroComponent;
  let fixture: ComponentFixture<OnboardingStageZeroComponent>;

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
        HttpClientTestingModule,
        OnboardingStageZeroComponent,
      ],
      providers: [{ provide: AuthRepository, useValue: authSpy }],
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
