/** @format */

import { signal, WritableSignal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { ValidationService } from "@corelib";
import { of } from "rxjs";
import { UpdateProfileUseCase } from "@api/auth/use-cases/update-profile.use-case";
import { UpdateOnboardingStageUseCase } from "@api/auth/use-cases/update-onboarding-stage.use-case";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { User } from "@domain/auth/user.model";
import { initial } from "@domain/shared/async-state";
import { fail, ok } from "@domain/shared/result.type";
import { OnboardingService } from "../../onboarding.service";
import { OnboardingStageZeroInfoService } from "./onboarding-stage-zero-info.service";
import { OnboardingStageZeroUIInfoService } from "./ui/onboarding-stage-zero-ui-info.service";
import { OnboardingUIInfoService } from "./ui/onboarding-ui-info.service";

describe("OnboardingStageZeroInfoService", () => {
  let service: OnboardingStageZeroInfoService;
  let profile: WritableSignal<User | null>;
  let updateProfileUseCase: { execute: ReturnType<typeof vi.fn> };
  let updateOnboardingStageUseCase: { execute: ReturnType<typeof vi.fn> };
  let profileInfoService: {
    profile: typeof profile;
    applyProfileUpdated: ReturnType<typeof vi.fn>;
  };
  let stageZeroUI: {
    stageForm: FormGroup;
    achievements: FormArray;
    education: FormArray;
    workExperience: FormArray;
    userLanguages: FormArray;
    applySkipRegistrationModalError: ReturnType<typeof vi.fn>;
    applySubmitModalError: ReturnType<typeof vi.fn>;
  };
  let stageSubmitting: WritableSignal<any>;
  let skipSubmitting: WritableSignal<any>;

  const currentProfile = { id: 42 } as User;
  const updatedProfile = { id: 42, firstName: "Иван" } as User;

  beforeEach(() => {
    const formBuilder = new FormBuilder();
    const stageForm = formBuilder.group({
      avatar: ["avatar.png"],
      city: ["Москва"],
      education: formBuilder.array([]),
      workExperience: formBuilder.array([]),
      userLanguages: formBuilder.array([]),
      achievements: formBuilder.array([]),
    });

    profile = signal<User | null>(currentProfile);
    updateProfileUseCase = { execute: vi.fn().mockReturnValue(of(ok(updatedProfile))) };
    updateOnboardingStageUseCase = {
      execute: vi.fn().mockReturnValue(of(ok(updatedProfile))),
    };
    profileInfoService = {
      profile,
      applyProfileUpdated: vi.fn(),
    };
    stageZeroUI = {
      stageForm,
      achievements: stageForm.get("achievements") as FormArray,
      education: stageForm.get("education") as FormArray,
      workExperience: stageForm.get("workExperience") as FormArray,
      userLanguages: stageForm.get("userLanguages") as FormArray,
      applySkipRegistrationModalError: vi.fn(),
      applySubmitModalError: vi.fn(),
    };
    stageSubmitting = signal(initial());
    skipSubmitting = signal(initial());

    TestBed.configureTestingModule({
      providers: [
        OnboardingStageZeroInfoService,
        {
          provide: Router,
          useValue: { navigateByUrl: vi.fn().mockResolvedValue(true) },
        },
        {
          provide: ValidationService,
          useValue: { getFormValidation: vi.fn().mockReturnValue(true) },
        },
        {
          provide: OnboardingService,
          useValue: { setFormValue: vi.fn() },
        },
        {
          provide: OnboardingUIInfoService,
          useValue: {
            stageSubmitting$: stageSubmitting,
            skipSubmitting$: skipSubmitting,
          },
        },
        {
          provide: OnboardingStageZeroUIInfoService,
          useValue: stageZeroUI,
        },
        {
          provide: ProfileInfoService,
          useValue: profileInfoService,
        },
        {
          provide: UpdateProfileUseCase,
          useValue: updateProfileUseCase,
        },
        {
          provide: UpdateOnboardingStageUseCase,
          useValue: updateOnboardingStageUseCase,
        },
      ],
    });

    service = TestBed.inject(OnboardingStageZeroInfoService);
  });

  it("onSubmit передает profile.id отдельно от данных формы", () => {
    service.onSubmit();

    expect(updateProfileUseCase.execute).toHaveBeenCalledExactlyOnceWith(42, {
      avatar: "avatar.png",
      city: "Москва",
      education: [],
      workExperience: [],
      userLanguages: [],
      achievements: [],
    });
  });

  it("onSkipRegistration передает profile.id отдельно от кратких данных", () => {
    service.onSkipRegistration();

    expect(updateProfileUseCase.execute).toHaveBeenCalledExactlyOnceWith(42, {
      avatar: "avatar.png",
      city: "Москва",
    });
    expect(profileInfoService.applyProfileUpdated).toHaveBeenCalledExactlyOnceWith(updatedProfile);
  });

  it("не обновляет профиль и переводит submit в failure без загруженного profile", () => {
    profile.set(null);

    service.onSubmit();

    expect(updateProfileUseCase.execute).not.toHaveBeenCalled();
    expect(updateOnboardingStageUseCase.execute).not.toHaveBeenCalled();
    expect(stageSubmitting().status).toBe("failure");
    expect(stageZeroUI.applySubmitModalError).toHaveBeenCalledOnce();
  });

  it("не обновляет профиль и переводит skip в failure без корректного profile.id", () => {
    profile.set({ id: undefined } as unknown as User);

    service.onSkipRegistration();

    expect(updateProfileUseCase.execute).not.toHaveBeenCalled();
    expect(updateOnboardingStageUseCase.execute).not.toHaveBeenCalled();
    expect(skipSubmitting().status).toBe("failure");
    expect(stageZeroUI.applySkipRegistrationModalError).toHaveBeenCalledOnce();
  });

  it("не обновляет onboarding stage после неуспешного PATCH профиля", () => {
    updateProfileUseCase.execute.mockReturnValue(
      of(fail({ kind: "server_error", cause: new Error("PATCH failed") })),
    );

    service.onSubmit();

    expect(updateOnboardingStageUseCase.execute).not.toHaveBeenCalled();
  });

  it("после успешного PATCH обновляет onboarding stage с корректным ID", () => {
    service.onSubmit();

    expect(updateOnboardingStageUseCase.execute).toHaveBeenCalledExactlyOnceWith(1, 42);
    expect(profileInfoService.applyProfileUpdated).toHaveBeenCalledExactlyOnceWith(updatedProfile);
  });
});
