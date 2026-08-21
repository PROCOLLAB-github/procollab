/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { Skill } from "@domain/skills/skill.model";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { NavigationService } from "../../../paths/navigation.service";
import { ProjectStepService } from "../../../project/project-step.service";
import { NavService } from "@api/shared/nav.service";
import { SaveProfileUseCase } from "@api/profile/use-cases/save-profile.use-case";
import { ProfileInfoService } from "../profile-info.service";
import { ProfileEditInfoService } from "./profile-edit-info.service";
import { ProfileFormService } from "./profile-form.service";

describe("ProfileEditInfoService", () => {
  let service: ProfileEditInfoService;
  let profileFormService: ProfileFormService;
  let saveProfileUseCase: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    saveProfileUseCase = {
      execute: vi.fn().mockReturnValue(of({ ok: true, value: { id: 42 } })),
    };

    TestBed.configureTestingModule({
      providers: [
        ProfileEditInfoService,
        ProfileFormService,
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } },
        { provide: NavigationService, useValue: { profileRedirect: vi.fn() } },
        { provide: NavService, useValue: { setNavTitle: vi.fn() } },
        { provide: ProjectStepService, useValue: { setStepFromRoute: vi.fn() } },
        { provide: SnackbarService, useValue: { success: vi.fn() } },
        { provide: SaveProfileUseCase, useValue: saveProfileUseCase },
        {
          provide: AuthRepositoryPort,
          useValue: {
            updateAvatar: vi.fn(),
            updateProfile: vi.fn(),
          },
        },
        {
          provide: ProfileInfoService,
          useValue: {
            changeableRoles: signal([]),
            profile: signal(null),
            applyProfileUpdated: vi.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(ProfileEditInfoService);
    profileFormService = TestBed.inject(ProfileFormService);
  });

  it("should include cleaned links in save payload", () => {
    const form = profileFormService.getForm();
    profileFormService.profileId.set(42);
    profileFormService.addLink(" https://t.me/procollab ");
    profileFormService.addLink(" ");

    form.patchValue({
      firstName: "Иван",
      lastName: "Иванов",
      birthday: "25.03.1990",
      city: "Москва",
      speciality: "Frontend developer",
      skills: [{ id: 1, name: "Angular" }] as Skill[],
    });

    service.saveProfile();

    expect(saveProfileUseCase.execute).toHaveBeenCalledTimes(1);
    expect(saveProfileUseCase.execute.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        birthday: "1990-03-25",
        links: ["https://t.me/procollab"],
        skillsIds: [1],
      }),
    );
  });
});
