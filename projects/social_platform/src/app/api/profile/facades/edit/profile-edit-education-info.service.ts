/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { ProfileFormService } from "./profile-form.service";
import { ProfileEditInfoService } from "./profile-edit-info.service";
import { transformYearStringToNumber } from "@utils/helpers/transformYear";

@Injectable()
export class ProfileEditEducationInfoService {
  private readonly fb = inject(FormBuilder);
  private readonly profileFormService = inject(ProfileFormService);
  private readonly profileEditInfoService = inject(ProfileEditInfoService);

  private readonly destroy$ = new Subject<void>();

  private readonly profileForm = this.profileFormService.getForm();

  private readonly editIndex = this.profileEditInfoService.editIndex;

  readonly showEducationFields = signal<boolean>(false);
  readonly editEducationClick = signal<boolean>(false);

  readonly educationItems = signal<any[]>([]);
  private readonly education = this.profileFormService.education;

  private readonly yearListEducation = this.profileFormService.yearListEducation;
  private readonly educationStatusList = this.profileFormService.educationStatusList;
  private readonly educationLevelList = this.profileFormService.educationLevelList;

  readonly selectedEntryYearEducationId = signal<number | undefined>(undefined);
  readonly selectedComplitionYearEducationId = signal<number | undefined>(undefined);
  readonly selectedEducationStatusId = signal<number | undefined>(undefined);
  readonly selectedEducationLevelId = signal<number | undefined>(undefined);

  private readonly isModalErrorSkillsChoose = this.profileEditInfoService.isModalErrorSkillsChoose;
  private readonly isModalErrorSkillChooseText =
    this.profileEditInfoService.isModalErrorSkillChooseText;

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Добавление записи об образовании
   * Валидирует форму и добавляет новую запись в массив образования
   */
  addEducation() {
    if (!this.showEducationFields()) {
      this.showEducationFields.set(true);
      return;
    }

    ["organizationName", "educationStatus"].forEach(name =>
      this.profileForm.get(name)?.clearValidators()
    );
    ["organizationName", "educationStatus"].forEach(name =>
      this.profileForm.get(name)?.setValidators([Validators.required])
    );
    ["organizationName", "educationStatus"].forEach(name =>
      this.profileForm.get(name)?.updateValueAndValidity()
    );
    ["organizationName", "educationStatus"].forEach(name =>
      this.profileForm.get(name)?.markAsTouched()
    );

    const entryYear =
      typeof this.profileForm.get("entryYear")?.value === "string"
        ? +this.profileForm.get("entryYear")?.value.slice(0, 5)
        : this.profileForm.get("entryYear")?.value;
    const completionYear =
      typeof this.profileForm.get("completionYear")?.value === "string"
        ? +this.profileForm.get("completionYear")?.value.slice(0, 5)
        : this.profileForm.get("completionYear")?.value;

    if (entryYear !== null && completionYear !== null && entryYear > completionYear) {
      this.isModalErrorSkillsChoose.set(true);
      this.isModalErrorSkillChooseText.set("Год начала обучения должен быть меньше года окончания");
      return;
    }

    const educationItem = this.fb.group({
      organizationName: this.profileForm.get("organizationName")?.value,
      entryYear,
      completionYear,
      description: this.profileForm.get("description")?.value,
      educationStatus: this.profileForm.get("educationStatus")?.value,
      educationLevel: this.profileForm.get("educationLevel")?.value,
    });

    const isOrganizationValid = this.profileForm.get("organizationName")?.valid;
    const isStatusValid = this.profileForm.get("educationStatus")?.valid;

    if (isOrganizationValid && isStatusValid) {
      if (this.editIndex() !== null) {
        this.educationItems.update(items => {
          const updatedItems = [...items];
          updatedItems[this.editIndex()!] = educationItem.value;

          this.education.at(this.editIndex()!).patchValue(educationItem.value);
          return updatedItems;
        });
        this.editIndex.set(null);
      } else {
        this.educationItems.update(items => [...items, educationItem.value]);
        this.education.push(educationItem);
      }
      [
        "organizationName",
        "entryYear",
        "completionYear",
        "description",
        "educationStatus",
        "educationLevel",
      ].forEach(name => {
        this.profileForm.get(name)?.reset();
        this.profileForm.get(name)?.setValue("");
        this.profileForm.get(name)?.clearValidators();
        this.profileForm.get(name)?.markAsPristine();
        this.profileForm.get(name)?.updateValueAndValidity();
      });
      this.showEducationFields.set(false);
    }
    this.editEducationClick.set(false);
  }

  /**
   * Редактирование записи об образовании
   * @param index - индекс записи в массиве образования
   */
  editEducation(index: number) {
    this.editEducationClick.set(true);
    this.showEducationFields.set(true);
    const educationItem = this.education.value[index];

    this.yearListEducation.forEach(entryYearWork => {
      if (transformYearStringToNumber(entryYearWork.value as string) === educationItem.entryYear) {
        this.selectedEntryYearEducationId.set(entryYearWork.id);
      }
    });

    this.yearListEducation.forEach(completionYearWork => {
      if (
        transformYearStringToNumber(completionYearWork.value as string) ===
        educationItem.completionYear
      ) {
        this.selectedComplitionYearEducationId.set(completionYearWork.id);
      }
    });

    this.educationLevelList.forEach(educationLevel => {
      if (educationLevel.value === educationItem.educationLevel) {
        this.selectedEducationLevelId.set(educationLevel.id);
      }
    });

    this.educationStatusList.forEach(educationStatus => {
      if (educationStatus.value === educationItem.educationStatus) {
        this.selectedEducationStatusId.set(educationStatus.id);
      }
    });

    this.profileForm.patchValue({
      organizationName: educationItem.organizationName,
      entryYear: educationItem.entryYear,
      completionYear: educationItem.completionYear,
      description: educationItem.description,
      educationStatus: educationItem.educationStatus,
      educationLevel: educationItem.educationLevel,
    });
    this.editIndex.set(index);
  }

  /**
   * Удаление записи об образовании
   * @param i - индекс записи для удаления
   */
  removeEducation(i: number) {
    this.educationItems.update(items => items.filter((_, index) => index !== i));

    this.education.removeAt(i);
  }
}
