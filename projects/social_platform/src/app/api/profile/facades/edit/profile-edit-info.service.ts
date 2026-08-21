/** @format */

import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { ProfileFormService } from "./profile-form.service";
import { Achievement } from "@domain/auth/user.model";
import { Skill } from "@domain/skills/skill.model";
import { NavigationService } from "../../../paths/navigation.service";
import { ProjectStepService } from "../../../project/project-step.service";
import { NavService } from "@api/shared/nav.service";
import { ActivatedRoute } from "@angular/router";
import { AsyncState, failure, initial, loading, success } from "@domain/shared/async-state";
import { EditStep } from "@core/lib/models/edit-step";
import { SaveProfileUseCase } from "@api/profile/use-cases/save-profile.use-case";
import { ProfileInfoService } from "../profile-info.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { INVALID_PROFILE_ID_MESSAGE, isValidProfileId } from "@domain/auth/profile-id";
import { AbstractControl, FormArray, FormGroup } from "@angular/forms";
import { formatBirthdayForApi } from "./profile-edit-validation.utils";
import { resolveProfileSaveErrorText } from "./profile-save-error.utils";

/** Фасад редактирования профиля: сбор формы, `SaveProfileUseCase`, раскрытие групп. */
@Injectable()
export class ProfileEditInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly navigationService = inject(NavigationService);
  private readonly navService = inject(NavService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly profileFormService = inject(ProfileFormService);
  private readonly projectStepService = inject(ProjectStepService);
  private readonly profileInfoService = inject(ProfileInfoService);

  private readonly saveProfileUseCase = inject(SaveProfileUseCase);
  private readonly snackbarService = inject(SnackbarService);

  private readonly profileForm = this.profileFormService.getForm();

  readonly editIndex = signal<number | null>(null);

  readonly profileFormSubmitting$ = signal<AsyncState<void>>(initial());

  readonly openGroupIndex = signal<number | null>(null);

  readonly isModalErrorSkillsChoose = signal<boolean>(false);
  readonly isModalErrorSkillChooseText = signal<string>("");

  private readonly typeSpecific = this.profileFormService.typeSpecific;
  private readonly achievements = this.profileFormService.achievements;
  readonly profileId = this.profileFormService.profileId;

  private userTypeMap: { [type: number]: string } = {
    1: "member",
    2: "mentor",
    3: "expert",
    4: "investor",
  };

  initializationEditInfo(): void {
    this.navService.setNavTitle("Редактирование профиля");

    // Получение текущего шага редактирования из query параметров
    this.setupEditingStep();
  }

  private setupEditingStep(): void {
    const stepFromUrl = this.route.snapshot.queryParams["editingStep"] as EditStep;
    if (stepFromUrl) {
      this.projectStepService.setStepFromRoute(stepFromUrl);
    }
  }

  onGroupToggled(index: number, isOpen: boolean): void {
    this.openGroupIndex.set(isOpen ? index : null);
  }

  isGroupDisabled(index: number): boolean {
    return this.openGroupIndex() !== null && this.openGroupIndex() !== index;
  }

  saveProfile(): void {
    this.isModalErrorSkillChooseText.set("");
    this.profileForm.markAllAsTouched();
    this.profileForm.updateValueAndValidity();

    const tempFields = [
      "organizationName",
      "entryYear",
      "completionYear",
      "description",
      "educationLevel",
      "educationStatus",
      "organization",
      "entryYearWork",
      "completionYearWork",
      "descriptionWork",
      "jobPosition",
      "language",
      "languageLevel",
      "title",
      "status",
      "year",
      "files",
    ];

    tempFields.forEach(name => {
      const control = this.profileForm.get(name);
      if (control) {
        control.clearValidators();
        control.updateValueAndValidity();
      }
    });

    const lengthLimits: { field: string; limit: number }[] = [
      { field: "city", limit: 100 },
      { field: "aboutMe", limit: 300 },
      { field: "organizationName", limit: 100 },
      { field: "description", limit: 400 },
      { field: "organization", limit: 50 },
      { field: "descriptionWork", limit: 400 },
    ];

    const hasLengthOverflow = lengthLimits.some(({ field, limit }) => {
      const value = this.profileForm.get(field)?.value;
      return typeof value === "string" && value.length > limit;
    });

    if (hasLengthOverflow) {
      this.isModalErrorSkillsChoose.set(true);
      this.isModalErrorSkillChooseText.set(
        "Превышено допустимое количество символов в одном из полей",
      );
      return;
    }

    const localErrorText = this.resolveLocalFormErrorText();
    if (localErrorText) {
      this.isModalErrorSkillsChoose.set(true);
      this.isModalErrorSkillChooseText.set(localErrorText);
      return;
    }

    const mainFieldsValid = ["firstName", "lastName", "birthday", "speciality", "city"].every(
      name => this.profileForm.get(name)?.valid,
    );

    if (!mainFieldsValid || this.profileFormSubmitting$().status === "loading") {
      this.isModalErrorSkillsChoose.set(true);
      return;
    }

    const profileId = this.profileId();
    if (!isValidProfileId(profileId)) {
      this.profileFormSubmitting$.set(failure("profile_edit_error"));
      this.isModalErrorSkillsChoose.set(true);
      this.isModalErrorSkillChooseText.set(INVALID_PROFILE_ID_MESSAGE);
      return;
    }

    this.profileFormSubmitting$.set(loading());

    const achievements = this.achievements.value.map((achievement: Achievement) => ({
      ...(achievement.id && { id: achievement.id }),
      title: achievement.title,
      ...(achievement.status ? { status: achievement.status } : {}),
      year: achievement.year,
      fileLinks:
        achievement.files && Array.isArray(achievement.files)
          ? achievement.files
              .map((file: any) => (typeof file === "string" ? file : file.link))
              .filter(Boolean)
          : achievement.files
            ? [achievement.files]
            : [],
    }));

    // Построение объекта профиля с только необходимыми полями
    const newProfile: any = {
      first_name: this.profileForm.value.firstName?.trim(),
      last_name: this.profileForm.value.lastName?.trim(),
      email: this.profileForm.value.email,
      user_type: this.profileForm.value.userType,
      city: this.profileForm.value.city,
      about_me: this.profileForm.value.aboutMe || "",
      avatar: this.profileForm.value.avatar || null,
      cover_image_address: this.profileForm.value.coverImageAddress || null,
      phoneNumber: this.profileForm.value.phoneNumber
        ? this.profileForm.value.phoneNumber.trim().replace(/^\+?[87]/, "+7")
        : null,
      speciality: this.profileForm.value.speciality,
      skillsIds: this.profileForm.value.skills.map((s: Skill) => s.id),
      links: this.profileFormService.getCleanLinks(),
    };

    // Добавляем birthday если он указан
    if (this.profileForm.value.birthday) {
      newProfile.birthday = formatBirthdayForApi(this.profileForm.value.birthday);
    }

    // Добавляем специфичные для типа пользователя поля
    if (this.userTypeMap[this.profileForm.value.userType]) {
      newProfile[this.userTypeMap[this.profileForm.value.userType]] = this.typeSpecific.value;
    }

    // Добавляем связанные данные если они были отредактированы
    if (this.achievements.length > 0) {
      newProfile.achievements = achievements;
    }
    if (this.profileForm.value.education?.length > 0) {
      newProfile.education = this.profileForm.value.education;
    }
    if (this.profileForm.value.workExperience?.length > 0) {
      newProfile.work_experience = this.profileForm.value.workExperience;
    }
    if (this.profileForm.value.userLanguages?.length > 0) {
      newProfile.user_languages = this.profileForm.value.userLanguages;
    }

    this.saveProfileUseCase
      .execute(profileId, newProfile)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (!result.ok) {
          this.profileFormSubmitting$.set(failure("profile_edit_error"));
          this.isModalErrorSkillsChoose.set(true);
          this.isModalErrorSkillChooseText.set(resolveProfileSaveErrorText(result.error.cause));
          return;
        }

        this.profileInfoService.applyProfileUpdated(result.value);
        this.profileFormSubmitting$.set(success(undefined));
        this.snackbarService.success("Профиль сохранён");
        this.navigationService.profileRedirect(result.value.id);
      });
  }

  private resolveLocalFormErrorText(): string {
    const firstNameError = this.resolveControlErrorText("Имя", this.profileForm.get("firstName"));
    if (firstNameError) return firstNameError;

    const lastNameError = this.resolveControlErrorText("Фамилия", this.profileForm.get("lastName"));
    if (lastNameError) return lastNameError;

    const birthdayError = this.resolveControlErrorText(
      "Дата рождения",
      this.profileForm.get("birthday"),
    );
    if (birthdayError) return birthdayError;

    const specialityError = this.resolveControlErrorText(
      "Специальность",
      this.profileForm.get("speciality"),
    );
    if (specialityError) return specialityError;

    const cityError = this.resolveControlErrorText("Город", this.profileForm.get("city"));
    if (cityError) return cityError;

    const phoneError = this.resolveControlErrorText("Телефон", this.profileForm.get("phoneNumber"));
    if (phoneError) return phoneError;

    const skillsError = this.resolveControlErrorText("Навыки", this.profileForm.get("skills"));
    if (skillsError) return skillsError;

    const languagesError = this.resolveControlErrorText(
      "Языки",
      this.profileForm.get("userLanguages"),
    );
    if (languagesError) return languagesError;

    const educationError = this.resolveIndexedGroupErrorText(
      "Образование",
      this.profileForm.get("education") as FormArray,
    );
    if (educationError) return educationError;

    const workError = this.resolveIndexedGroupErrorText(
      "Опыт работы",
      this.profileForm.get("workExperience") as FormArray,
    );
    if (workError) return workError;

    const achievementError = this.resolveIndexedGroupErrorText(
      "Достижение",
      this.profileForm.get("achievements") as FormArray,
    );
    if (achievementError) return achievementError;

    return "";
  }

  private resolveIndexedGroupErrorText(label: string, formArray: FormArray): string {
    const index = formArray.controls.findIndex(control => control.invalid);
    if (index === -1) return "";

    const group = formArray.at(index) as FormGroup;
    const groupError = this.resolveControlErrorText(`${label} #${index + 1}`, group);
    if (groupError) return groupError;

    const invalidEntry = Object.entries(group.controls).find(([, control]) => control.invalid);
    if (!invalidEntry) return "";

    return this.resolveControlErrorText(`${label} #${index + 1}`, invalidEntry[1]);
  }

  private resolveControlErrorText(label: string, control: AbstractControl | null): string {
    if (!control?.errors) return "";

    if (control.errors["required"]) return `${label}: поле обязательно для заполнения`;
    if (control.errors["minlength"]) return `${label}: укажите минимум 2 символа`;
    if (control.errors["invalidLanguage"]) return `${label}: используйте только кириллицу`;
    if (control.errors["invalidDateFormat"])
      return `${label}: укажите реальную дату в формате ДД.ММ.ГГГГ`;
    if (control.errors["tooYoung"]) return `${label}: возраст должен быть от 12 до 99 лет`;
    if (control.errors["tooOld"]) return `${label}: возраст должен быть от 12 до 99 лет`;
    if (control.errors["pattern"]) {
      return `${label}: укажите телефон в международном формате, например +79991234567`;
    }
    if (control.errors["minSkills"] || control.errors["maxSkills"]) {
      return `${label}: необходимо выбрать от 1 до 20 навыков`;
    }
    if (control.errors["maxLanguages"]) return `${label}: можно добавить не более 4 языков`;
    if (control.errors["duplicateLanguages"]) return `${label}: нельзя добавлять одинаковые языки`;
    if (control.errors["yearRangeError"]) {
      return `${label}: год начала должен быть меньше или равен году окончания`;
    }
    if (control.errors["yearBoundsError"]) return `${label}: укажите корректный год`;

    return "";
  }
}
