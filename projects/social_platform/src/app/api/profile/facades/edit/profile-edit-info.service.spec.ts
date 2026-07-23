/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { ProfileEditInfoService } from "./profile-edit-info.service";
import { ProfileFormService } from "./profile-form.service";
import { NavigationService } from "../../../paths/navigation.service";
import { ProjectStepService } from "../../../project/project-step.service";
import { NavService } from "@api/shared/nav.service";
import { SaveProfileUseCase } from "@api/profile/use-cases/save-profile.use-case";
import { ProfileInfoService } from "../profile-info.service";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { User } from "@domain/auth/user.model";
import { ok } from "@domain/shared/result.type";

describe("ProfileEditInfoService", () => {
  let service: ProfileEditInfoService;
  let profileId: ReturnType<typeof signal<number | undefined>>;
  let executeSaveProfile: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    profileId = signal<number | undefined>(42);
    executeSaveProfile = vi.fn();

    const values = {
      firstName: "Иван",
      lastName: "Иванов",
      email: "ivan@example.com",
      userType: 1,
      birthday: "2000-01-01",
      speciality: "Разработчик",
      city: "Москва",
      aboutMe: "",
      avatar: null,
      coverImageAddress: null,
      phoneNumber: "",
      skills: [],
      education: [],
      workExperience: [],
      userLanguages: [],
    };
    const controls: Record<string, any> = Object.fromEntries(
      Object.entries(values).map(([name, value]) => [
        name,
        {
          value,
          valid: true,
          clearValidators: vi.fn(),
          updateValueAndValidity: vi.fn(),
        },
      ]),
    );
    const form = {
      value: values,
      markAllAsTouched: vi.fn(),
      updateValueAndValidity: vi.fn(),
      get: vi.fn((name: string) => controls[name] ?? null),
    };

    TestBed.configureTestingModule({
      providers: [
        ProfileEditInfoService,
        {
          provide: ProfileFormService,
          useValue: {
            getForm: () => form,
            profileId,
            typeSpecific: { value: {} },
            achievements: { value: [], length: 0 },
          },
        },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } },
        { provide: NavigationService, useValue: { profileRedirect: vi.fn() } },
        { provide: ProjectStepService, useValue: { setStepFromRoute: vi.fn() } },
        { provide: NavService, useValue: { setNavTitle: vi.fn() } },
        { provide: SaveProfileUseCase, useValue: { execute: executeSaveProfile } },
        {
          provide: ProfileInfoService,
          useValue: { applyProfileUpdated: vi.fn() },
        },
        { provide: SnackbarService, useValue: { success: vi.fn() } },
      ],
    });
    service = TestBed.inject(ProfileEditInfoService);
  });

  it("передает текущий profileId отдельно и не добавляет id в payload", () => {
    executeSaveProfile.mockReturnValue(of(ok({ id: 42 } as User)));

    service.saveProfile();

    expect(executeSaveProfile).toHaveBeenCalledOnce();
    expect(executeSaveProfile.mock.calls[0][0]).toBe(42);
    expect(executeSaveProfile.mock.calls[0][1]).not.toHaveProperty("id");
  });

  it("не отправляет профиль без корректного profileId", () => {
    profileId.set(undefined);

    service.saveProfile();

    expect(executeSaveProfile).not.toHaveBeenCalled();
    expect(service.profileFormSubmitting$().status).toBe("failure");
    expect(service.isModalErrorSkillsChoose()).toBe(true);
  });
});
