/** @format */

/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfileEditComponent } from "./edit.component";
import { of } from "rxjs";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { ReactiveFormsModule } from "@angular/forms";
import { provideRouter } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { provideNgxMask } from "ngx-mask";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { SpecializationsRepositoryPort } from "@domain/specializations/ports/specializations.repository.port";
import { SkillsRepositoryPort } from "@domain/skills/ports/skills.repository.port";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";
import { API_URL } from "@corelib";

describe("ProfileEditComponent", () => {
  let component: ProfileEditComponent;
  let fixture: ComponentFixture<ProfileEditComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
      changeableRoles: of([]),
    };

    const authPortSpy = {
      fetchProfile: of({}),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
    };

    const specializationsSpy = {
      getSpecializationsNested: () => of([]),
      getSpecializationsInline: () => of({ count: 0, results: [], next: "", previous: "" }),
    };

    const skillsSpy = {
      getSkillsNested: () => of([]),
      getSkillsInline: () => of({ count: 0, results: [], next: "", previous: "" }),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, ProfileEditComponent],
      providers: [
        { provide: AuthRepository, useValue: authSpy },
        { provide: AuthRepositoryPort, useValue: authPortSpy },
        { provide: SpecializationsRepositoryPort, useValue: specializationsSpy },
        { provide: SkillsRepositoryPort, useValue: skillsSpy },
        { provide: ProjectRepositoryPort, useValue: {} },
        {
          provide: ProjectSubscriptionRepositoryPort,
          useValue: { getSubscriptions: of({ results: [], count: 0 }) },
        },
        { provide: API_URL, useValue: "" },
        provideNgxMask(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
