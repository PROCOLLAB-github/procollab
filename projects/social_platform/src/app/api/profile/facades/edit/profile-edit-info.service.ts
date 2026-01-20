/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { concatMap, Subject, takeUntil } from "rxjs";
import { ProfileFormService } from "./profile-form.service";
import { Achievement } from "projects/social_platform/src/app/domain/auth/user.model";
import dayjs from "dayjs";
import { AuthService } from "../../../auth";
import { Skill } from "projects/social_platform/src/app/domain/skills/skill";
import { NavigationService } from "../../../paths/navigation.service";

@Injectable()
export class ProfileEditInfoService {
  private readonly profileFormService = inject(ProfileFormService);
  private readonly authService = inject(AuthService);
  private readonly navigationService = inject(NavigationService);

  private readonly destroy$ = new Subject<void>();

  private readonly profileForm = this.profileFormService.getForm();

  readonly editIndex = signal<number | null>(null);

  readonly profileFormSubmitting = signal<boolean>(false);

  readonly isModalErrorSkillsChoose = signal<boolean>(false);
  readonly isModalErrorSkillChooseText = signal<string>("");

  private readonly typeSpecific = this.profileFormService.typeSpecific;
  private readonly achievements = this.profileFormService.achievements;
  private readonly profileId = this.profileFormService.profileId;

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

    if (!mainFieldsValid || this.profileFormSubmitting()) {
      this.isModalErrorSkillsChoose.set(true);
      return;
    }

    this.profileFormSubmitting.set(true);

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

    const newProfile = {
      ...this.profileForm.value,
      achievements,
      [this.userTypeMap[this.profileForm.value.userType]]: this.typeSpecific.value,
      typeSpecific: undefined,
      birthday: this.profileForm.value.birthday
        ? dayjs(this.profileForm.value.birthday, "DD.MM.YYYY").format("YYYY-MM-DD")
        : undefined,
      skillsIds: this.profileForm.value.skills.map((s: Skill) => s.id),
      phoneNumber:
        typeof this.profileForm.value.phoneNumber === "string"
          ? this.profileForm.value.phoneNumber.replace(/^([87])/, "+7")
          : this.profileForm.value.phoneNumber,
    };

    this.authService
      .saveProfile(newProfile)
      .pipe(
        concatMap(() => this.authService.getProfile()),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.profileFormSubmitting.set(false);
          this.navigationService.profileRedirect(this.profileId());
        },
        error: error => {
          this.profileFormSubmitting.set(false);
          this.isModalErrorSkillsChoose.set(true);
          if (error.error.phone_number) {
            this.isModalErrorSkillChooseText.set(error.error.phone_number[0]);
          } else if (error.error.language) {
            this.isModalErrorSkillChooseText.set(error.error.language);
          } else if (error.error.achievements) {
            this.isModalErrorSkillChooseText.set(error.error.achievements[0]);
          } else if (error.error.work_experience?.[2]) {
            const errorText = error.error.work_experience[2].entry_year
              ? error.error.work_experience[2].entry_year
              : error.error.work_experience[2].completion_year;
            this.isModalErrorSkillChooseText.set(errorText);
          } else if (error.error.first_name?.[0]) {
            this.isModalErrorSkillChooseText.set(error.error.first_name?.[0]);
          } else if (error.error.last_name?.[0]) {
            this.isModalErrorSkillChooseText.set(error.error.last_name?.[0]);
          } else {
            this.isModalErrorSkillChooseText.set(error.error[0]);
          }
        },
      });
  }
}
