/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { OnboardingStageTwoComponent } from "./stage-two.component";
import { of } from "rxjs";
import { ReactiveFormsModule } from "@angular/forms";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { provideRouter } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { SkillsRepositoryPort } from "@domain/skills/ports/skills.repository.port";
import { SpecializationsRepositoryPort } from "@domain/specializations/ports/specializations.repository.port";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";

describe("StageTwoComponent", () => {
  let component: OnboardingStageTwoComponent;
  let fixture: ComponentFixture<OnboardingStageTwoComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
      saveProfile: of({}),
      setOnboardingStage: of({}),
    };

    const authPortSpy = jasmine.createSpyObj("AuthRepositoryPort", [
      "fetchProfile",
      "fetchUserRoles",
      "fetchChangeableRoles",
      "updateProfile",
    ], {
      fetchProfile: of({}),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
      updateProfile: of({}),
    });

    const skillsSpy = {
      getSkillsNested: () => of([]),
      getSkillsInline: () => of({ count: 0, results: [], next: "", previous: "" }),
    };

    const specializationsSpy = {
      getSpecializationsNested: () => of([]),
      getSpecializationsInline: () => of({ count: 0, results: [], next: "", previous: "" }),
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        OnboardingStageTwoComponent,
      ],
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
    fixture = TestBed.createComponent(OnboardingStageTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
