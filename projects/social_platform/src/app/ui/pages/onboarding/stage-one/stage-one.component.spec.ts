/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OnboardingStageOneComponent } from "./stage-one.component";
import { of } from "rxjs";
import { ReactiveFormsModule } from "@angular/forms";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { provideRouter } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { SkillsRepositoryPort } from "@domain/skills/ports/skills.repository.port";
import { SpecializationsRepositoryPort } from "@domain/specializations/ports/specializations.repository.port";

describe("StageOneComponent", () => {
  let component: OnboardingStageOneComponent;
  let fixture: ComponentFixture<OnboardingStageOneComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
      saveProfile: of({}),
      setOnboardingStage: of({}),
    };

    const authPortSpy = jasmine.createSpyObj(
      "AuthRepositoryPort",
      ["fetchProfile", "fetchUserRoles", "fetchChangeableRoles", "updateProfile"],
      {
        fetchProfile: of({}),
        fetchUserRoles: of([]),
        fetchChangeableRoles: of([]),
        updateProfile: of({}),
      }
    );

    const skillsSpy = jasmine.createSpyObj(
      "SkillsRepositoryPort",
      ["getSkillsNested", "getSkillsInline"],
      {
        getSkillsNested: of([]),
        getSkillsInline: of({ count: 0, results: [], next: "", previous: "" }),
      }
    );

    const specializationsSpy = jasmine.createSpyObj(
      "SpecializationsRepositoryPort",
      ["getSpecializationsNested", "getSpecializationsInline"],
      {
        getSpecializationsNested: of([]),
        getSpecializationsInline: of({ count: 0, results: [], next: "", previous: "" }),
      }
    );

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, OnboardingStageOneComponent],
      providers: [
        { provide: AuthRepository, useValue: authSpy },
        { provide: AuthRepositoryPort, useValue: authPortSpy },
        { provide: SkillsRepositoryPort, useValue: skillsSpy },
        { provide: SpecializationsRepositoryPort, useValue: specializationsSpy },
        provideRouter([]),
      ],
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
