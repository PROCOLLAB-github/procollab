/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OnboardingStageZeroComponent } from "./stage-zero.component";
import { of } from "rxjs";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { ReactiveFormsModule } from "@angular/forms";
import { provideRouter } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { provideNgxMask } from "ngx-mask";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";

describe("StageZeroComponent", () => {
  let component: OnboardingStageZeroComponent;
  let fixture: ComponentFixture<OnboardingStageZeroComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
      saveProfile: of({}),
      setOnboardingStage: of({}),
    };

    const authPortSpy = {
      fetchProfile: of({}),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, OnboardingStageZeroComponent],
      providers: [
        { provide: AuthRepository, useValue: authSpy },
        { provide: AuthRepositoryPort, useValue: authPortSpy },
        {
          provide: ProjectSubscriptionRepositoryPort,
          useValue: { getSubscriptions: of({ results: [], count: 0 }) },
        },
        provideNgxMask(),
        provideRouter([]),
      ],
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
