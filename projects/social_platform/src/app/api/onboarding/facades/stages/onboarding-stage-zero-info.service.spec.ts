/** @format */

import { signal } from "@angular/core";
import { FormArray, FormBuilder } from "@angular/forms";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { of } from "rxjs";
import { ValidationService } from "@corelib";
import { OnboardingStageZeroInfoService } from "./onboarding-stage-zero-info.service";
import { OnboardingService } from "../../onboarding.service";
import { OnboardingUIInfoService } from "./ui/onboarding-ui-info.service";
import { OnboardingStageZeroUIInfoService } from "./ui/onboarding-stage-zero-ui-info.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { UpdateProfileUseCase } from "@api/auth/use-cases/update-profile.use-case";
import { UpdateOnboardingStageUseCase } from "@api/auth/use-cases/update-onboarding-stage.use-case";
import { User } from "@domain/auth/user.model";
import { fail, ok } from "@domain/shared/result.type";
import { initial } from "@domain/shared/async-state";

describe("OnboardingStageZeroInfoService", () => {
  let service: OnboardingStageZeroInfoService;
  let profile: ReturnType<typeof signal<User | null>>;
  let updateProfile: ReturnType<typeof vi.fn>;
  let updateOnboardingStage: ReturnType<typeof vi.fn>;
  let applyProfileUpdated: ReturnType<typeof vi.fn>;
  let stageZeroUI: {
    stageForm: ReturnType<FormBuilder["group"]>;
    achievements: FormArray;
    education: FormArray;
    workExperience: FormArray;
    userLanguages: FormArray;
    applySubmitModalError: ReturnType<typeof vi.fn>;
    applySkipRegistrationModalError: ReturnType<typeof vi.fn>;
  };
  let onboardingUI: {
    stageSubmitting$: ReturnType<typeof signal>;
    skipSubmitting$: ReturnType<typeof signal>;
  };

  beforeEach(() => {
    const fb = new FormBuilder();
    const achievements = fb.array([]);
    const education = fb.array([]);
    const workExperience = fb.array([]);
    const userLanguages = fb.array([]);
    const stageForm = fb.group({
      avatar: ["avatar.png"],
      city: ["Москва"],
      achievements,
      education,
      workExperience,
      userLanguages,
    });

    profile = signal<User | null>({ id: 42 } as User);
    updateProfile = vi.fn();
    updateOnboardingStage = vi.fn();
    applyProfileUpdated = vi.fn();
    stageZeroUI = {
      stageForm,
      achievements,
      education,
      workExperience,
      userLanguages,
      applySubmitModalError: vi.fn(),
      applySkipRegistrationModalError: vi.fn(),
    };
    onboardingUI = {
      stageSubmitting$: signal(initial()),
      skipSubmitting$: signal(initial()),
    };

    TestBed.configureTestingModule({
      providers: [
        OnboardingStageZeroInfoService,
        { provide: Router, useValue: { navigateByUrl: vi.fn() } },
        { provide: ValidationService, useValue: { getFormValidation: vi.fn(() => true) } },
        {
          provide: OnboardingService,
          useValue: { formValue$: of({}), setFormValue: vi.fn() },
        },
        { provide: OnboardingUIInfoService, useValue: onboardingUI },
        { provide: OnboardingStageZeroUIInfoService, useValue: stageZeroUI },
        {
          provide: ProfileInfoService,
          useValue: { profile, applyProfileUpdated },
        },
        { provide: UpdateProfileUseCase, useValue: { execute: updateProfile } },
        {
          provide: UpdateOnboardingStageUseCase,
          useValue: { execute: updateOnboardingStage },
        },
      ],
    });
    service = TestBed.inject(OnboardingStageZeroInfoService);
  });

  it("onSubmit передает profile.id отдельно от данных формы", () => {
    updateProfile.mockReturnValue(of(ok({ id: 42 } as User)));
    updateOnboardingStage.mockReturnValue(of(ok({ id: 42 } as User)));

    service.onSubmit();

    expect(updateProfile).toHaveBeenCalledExactlyOnceWith(42, {
      avatar: "avatar.png",
      city: "Москва",
      education: [],
      workExperience: [],
      userLanguages: [],
      achievements: [],
    });
  });

  it("onSkipRegistration использует profile.id и применяет обновленный профиль", () => {
    const updatedProfile = { id: 42, city: "Москва" } as unknown as User;
    updateProfile.mockReturnValue(of(ok(updatedProfile)));

    service.onSkipRegistration();

    expect(updateProfile).toHaveBeenCalledExactlyOnceWith(42, {
      avatar: "avatar.png",
      city: "Москва",
    });
    expect(applyProfileUpdated).toHaveBeenCalledExactlyOnceWith(updatedProfile);
  });

  it("не обновляет профиль и показывает ошибку, если профиль отсутствует", () => {
    profile.set(null);

    service.onSubmit();

    expect(updateProfile).not.toHaveBeenCalled();
    expect(updateOnboardingStage).not.toHaveBeenCalled();
    expect(onboardingUI.stageSubmitting$().status).toBe("failure");
    expect(stageZeroUI.applySubmitModalError).toHaveBeenCalledOnce();
  });

  it("не обновляет профиль и показывает ошибку, если profile.id отсутствует", () => {
    profile.set({} as User);

    service.onSkipRegistration();

    expect(updateProfile).not.toHaveBeenCalled();
    expect(updateOnboardingStage).not.toHaveBeenCalled();
    expect(onboardingUI.skipSubmitting$().status).toBe("failure");
    expect(stageZeroUI.applySkipRegistrationModalError).toHaveBeenCalledOnce();
  });

  it("не обновляет onboarding stage после неуспешного обновления профиля", () => {
    updateProfile.mockReturnValue(of(fail({ kind: "server_error", cause: new Error("fail") })));

    service.onSubmit();

    expect(updateOnboardingStage).not.toHaveBeenCalled();
    expect(onboardingUI.stageSubmitting$().status).toBe("failure");
  });

  it("после успешного PATCH обновляет onboarding stage с тем же profile.id", () => {
    const updatedProfile = { id: 42, onboardingStage: 1 } as User;
    updateProfile.mockReturnValue(of(ok({ id: 42 } as User)));
    updateOnboardingStage.mockReturnValue(of(ok(updatedProfile)));

    service.onSubmit();

    expect(updateOnboardingStage).toHaveBeenCalledExactlyOnceWith(1, 42);
    expect(applyProfileUpdated).toHaveBeenCalledExactlyOnceWith(updatedProfile);
  });
});
