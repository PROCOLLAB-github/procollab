/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { ProfileFormService } from "./profile-form.service";
import { ProfileEditInfoService } from "./profile-edit-info.service";
import { transformYearStringToNumber } from "@utils/helpers/transformYear";

@Injectable()
export class ProfileEditAchievementsInfoService {
  private readonly fb = inject(FormBuilder);
  private readonly profileFormService = inject(ProfileFormService);
  private readonly profileEditInfoService = inject(ProfileEditInfoService);

  private readonly destroy$ = new Subject<void>();

  private readonly profileForm = this.profileFormService.getForm();
  private readonly editIndex = this.profileEditInfoService.editIndex;

  readonly achievementItems = signal<any[]>([]);
  private readonly achievements = this.profileFormService.achievements;

  private readonly achievementsYearList = this.profileFormService.achievementsYearList;

  readonly editAchievementsClick = signal<boolean>(false);
  readonly showAchievementsFields = signal<boolean>(false);

  readonly selectedAchievementsYearId = signal<number | undefined>(undefined);

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Добавление записи об достижении
   * Валидирует форму и добавляет новую запись в массив достижений
   */
  addAchievement(): void {
    if (!this.showAchievementsFields()) {
      this.showAchievementsFields.set(true);

      this.profileForm.patchValue({
        title: "",
        status: "",
        year: null,
        files: "",
      });

      return;
    }

    ["title", "status", "year"].forEach(name => this.profileForm.get(name)?.clearValidators());
    ["title", "status", "year"].forEach(name =>
      this.profileForm.get(name)?.setValidators([Validators.required])
    );
    ["title", "status", "year"].forEach(name =>
      this.profileForm.get(name)?.updateValueAndValidity()
    );
    ["title", "status", "year"].forEach(name => this.profileForm.get(name)?.markAsTouched());

    const achievementsYear =
      typeof this.profileForm.get("year")?.value === "string"
        ? +this.profileForm.get("year")?.value.slice(0, 5)
        : this.profileForm.get("year")?.value;

    const achievementsItem = this.fb.group({
      id: [null],
      title: this.profileForm.get("title")?.value,
      status: this.profileForm.get("status")?.value,
      year: achievementsYear,
      files: Array.isArray(this.profileForm.get("files")?.value)
        ? this.profileForm.get("files")?.value
        : [this.profileForm.get("files")?.value].filter(Boolean),
    });

    if (this.editIndex() !== null) {
      const existingId = this.achievements.at(this.editIndex()!).get("id")?.value;

      this.achievements.at(this.editIndex()!).patchValue({
        ...achievementsItem.value,
        id: existingId,
      });

      this.achievementItems.update(items => {
        const updatedItems = [...items];
        updatedItems[this.editIndex()!] = { ...achievementsItem.value, id: existingId };
        return updatedItems;
      });

      this.editIndex.set(null);
    } else {
      this.achievementItems.update(items => [...items, achievementsItem.value]);
      this.achievements.push(achievementsItem);
    }
    ["title", "status", "year", "files"].forEach(name => {
      this.profileForm.get(name)?.reset();
      this.profileForm.get(name)?.setValue("");
      this.profileForm.get(name)?.clearValidators();
      this.profileForm.get(name)?.markAsPristine();
      this.profileForm.get(name)?.markAsUntouched();
      this.profileForm.get(name)?.updateValueAndValidity();
    });

    this.showAchievementsFields.set(false);
    this.editAchievementsClick.set(false);
  }

  /**
   * Редактирование записи об достижений
   * @param index - индекс записи в массиве достижений
   */
  editAchievements(index: number) {
    this.editAchievementsClick.set(true);
    this.showAchievementsFields.set(true);
    const achievementItem = this.achievements.value[index];

    this.achievementsYearList.forEach(achievementYear => {
      if (transformYearStringToNumber(achievementYear.value as string) === achievementItem.year) {
        this.selectedAchievementsYearId.set(achievementYear.id);
      }
    });

    this.profileForm.patchValue({
      title: achievementItem.title,
      status: achievementItem.status,
      year: achievementItem.year,
      files: achievementItem.files,
    });
    this.editIndex.set(index);
  }

  /**
   * Удаление записи об достижении
   * @param i - индекс записи для удаления
   */
  removeAchievement(i: number): void {
    this.achievementItems.update(items => items.filter((_, index) => index !== i));
    this.achievements.removeAt(i);
  }
}
