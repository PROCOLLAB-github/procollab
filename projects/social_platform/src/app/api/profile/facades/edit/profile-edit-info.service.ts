/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { concatMap, Subject, takeUntil } from "rxjs";
import { ProfileFormService } from "./profile-form.service";
import { Achievement } from "projects/social_platform/src/app/domain/auth/user.model";
import dayjs from "dayjs";
import { Skill } from "projects/social_platform/src/app/domain/skills/skill";
import { NavigationService } from "../../../paths/navigation.service";
import { EditStep, ProjectStepService } from "../../../project/project-step.service";
import { NavService } from "@ui/services/nav/nav.service";
import { ActivatedRoute } from "@angular/router";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import {
  AsyncState,
  failure,
  initial,
  loading,
  success,
} from "projects/social_platform/src/app/domain/shared/async-state";

@Injectable()
export class ProfileEditInfoService {
  private readonly profileFormService = inject(ProfileFormService);
  private readonly authRepository = inject(AuthRepositoryPort);
  private readonly route = inject(ActivatedRoute);
  private readonly navigationService = inject(NavigationService);
  private readonly navService = inject(NavService);
  private readonly projectStepService = inject(ProjectStepService);

  private readonly destroy$ = new Subject<void>();

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

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  /**
   * Сохранение профиля пользователя
   * Валидирует всю форму и отправляет данные на сервер
   */
  saveProfile(): void {
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
      "phoneNumber",
    ];

    tempFields.forEach(name => {
      const control = this.profileForm.get(name);
      if (control) {
        control.clearValidators();
        control.updateValueAndValidity();
      }
    });

    const mainFieldsValid = ["firstName", "lastName", "birthday", "speciality", "city"].every(
      name => this.profileForm.get(name)?.valid
    );

    if (!mainFieldsValid || this.profileFormSubmitting$().status === "loading") {
      this.isModalErrorSkillsChoose.set(true);
      return;
    }

    this.profileFormSubmitting$.set(loading());

    const achievements = this.achievements.value.map((achievement: Achievement) => ({
      ...(achievement.id && { id: achievement.id }),
      title: achievement.title,
      status: achievement.status,
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
      id: this.profileId(),
      first_name: this.profileForm.value.firstName,
      last_name: this.profileForm.value.lastName,
      email: this.profileForm.value.email,
      user_type: this.profileForm.value.userType,
      city: this.profileForm.value.city,
      about_me: this.profileForm.value.aboutMe || "",
      avatar: this.profileForm.value.avatar || null,
      cover_image_address: this.profileForm.value.coverImageAddress || null,
      phone_number:
        typeof this.profileForm.value.phoneNumber === "string"
          ? this.profileForm.value.phoneNumber.replace(/^([87])/, "+7")
          : this.profileForm.value.phoneNumber,
      speciality: this.profileForm.value.speciality,
      skills_ids: this.profileForm.value.skills?.map((s: Skill) => s.id) || [],
    };

    // Добавляем birthday если он указан
    if (this.profileForm.value.birthday) {
      newProfile.birthday = dayjs(this.profileForm.value.birthday, "DD.MM.YYYY").format(
        "YYYY-MM-DD"
      );
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

    this.authRepository
      .updateProfile(newProfile)
      .pipe(
        concatMap(() => this.authRepository.fetchProfile()),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: profile => {
          this.profileFormSubmitting$.set(success(undefined));
          this.navigationService.profileRedirect(profile.id);
        },
        error: error => {
          this.profileFormSubmitting$.set(failure("profile_edit_error"));
          this.isModalErrorSkillsChoose.set(true);
          if (error.error?.phone_number) {
            this.isModalErrorSkillChooseText.set(error.error.phone_number[0]);
          } else if (error.error?.language) {
            this.isModalErrorSkillChooseText.set(error.error.language);
          } else if (error.error?.achievements) {
            this.isModalErrorSkillChooseText.set(error.error.achievements[0]);
          } else if (error.error?.work_experience?.[2]) {
            const errorText = error.error.work_experience[2].entry_year
              ? error.error.work_experience[2].entry_year
              : error.error.work_experience[2].completion_year;
            this.isModalErrorSkillChooseText.set(errorText);
          } else if (error.error?.first_name?.[0]) {
            this.isModalErrorSkillChooseText.set(error.error.first_name?.[0]);
          } else if (error.error?.last_name?.[0]) {
            this.isModalErrorSkillChooseText.set(error.error.last_name?.[0]);
          } else if (error.error?.[0]) {
            this.isModalErrorSkillChooseText.set(error.error[0]);
          } else {
            this.isModalErrorSkillChooseText.set("Ошибка при сохранении профиля");
          }
        },
      });
  }
}
