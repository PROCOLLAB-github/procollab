/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { transformYearStringToNumber } from "@utils/helpers/transformYear";
import { Subject } from "rxjs";
import { ProfileFormService } from "./profile-form.service";
import { ProfileEditInfoService } from "./profile-edit-info.service";

@Injectable()
export class ProfileEditExperienceInfoService {
  private readonly fb = inject(FormBuilder);
  private readonly profileFormService = inject(ProfileFormService);
  private readonly profileEditInfoService = inject(ProfileEditInfoService);

  private readonly destroy$ = new Subject<void>();

  private readonly profileForm = this.profileFormService.getForm();
  private readonly editIndex = this.profileEditInfoService.editIndex;

  readonly workItems = signal<any[]>([]);
  private readonly workExperience = this.profileFormService.workExperience;

  readonly editWorkClick = signal<boolean>(false);
  readonly showWorkFields = signal<boolean>(false);

  readonly yearListEducation = this.profileFormService.yearListEducation;

  readonly selectedEntryYearWorkId = signal<number | undefined>(undefined);
  readonly selectedComplitionYearWorkId = signal<number | undefined>(undefined);

  private readonly isModalErrorSkillsChoose = this.profileEditInfoService.isModalErrorSkillsChoose;
  private readonly isModalErrorSkillChooseText =
    this.profileEditInfoService.isModalErrorSkillChooseText;

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Добавление записи об опыте работы
   * Валидирует форму и добавляет новую запись в массив опыта работы
   */
  addWork() {
    if (!this.showWorkFields()) {
      this.showWorkFields.set(true);
      return;
    }

    ["organization", "jobPosition"].forEach(name => this.profileForm.get(name)?.clearValidators());
    ["organization", "jobPosition"].forEach(name =>
      this.profileForm.get(name)?.setValidators([Validators.required])
    );
    ["organization", "jobPosition"].forEach(name =>
      this.profileForm.get(name)?.updateValueAndValidity()
    );
    ["organization", "jobPosition"].forEach(name => this.profileForm.get(name)?.markAsTouched());

    const entryYear =
      typeof this.profileForm.get("entryYearWork")?.value === "string"
        ? this.profileForm.get("entryYearWork")?.value.slice(0, 5)
        : this.profileForm.get("entryYearWork")?.value;
    const completionYear =
      typeof this.profileForm.get("completionYearWork")?.value === "string"
        ? this.profileForm.get("completionYearWork")?.value.slice(0, 5)
        : this.profileForm.get("completionYearWork")?.value;

    if (entryYear !== null && completionYear !== null && entryYear > completionYear) {
      this.isModalErrorSkillsChoose.set(true);
      this.isModalErrorSkillChooseText.set("Год начала работы должен быть меньше года окончания");
      return;
    }

    const workItem = this.fb.group({
      organizationName: this.profileForm.get("organization")?.value,
      entryYear,
      completionYear,
      description: this.profileForm.get("descriptionWork")?.value,
      jobPosition: this.profileForm.get("jobPosition")?.value,
    });

    const isOrganizationValid = this.profileForm.get("organization")?.valid;
    const isPositionValid = this.profileForm.get("jobPosition")?.valid;

    if (isOrganizationValid && isPositionValid) {
      if (this.editIndex() !== null) {
        this.workItems.update(items => {
          const updatedItems = [...items];
          updatedItems[this.editIndex()!] = workItem.value;

          this.workExperience.at(this.editIndex()!).patchValue(workItem.value);
          return updatedItems;
        });
        this.editIndex.set(null);
      } else {
        this.workItems.update(items => [...items, workItem.value]);
        this.workExperience.push(workItem);
      }
      [
        "organization",
        "entryYearWork",
        "completionYearWork",
        "descriptionWork",
        "jobPosition",
      ].forEach(name => {
        this.profileForm.get(name)?.reset();
        this.profileForm.get(name)?.setValue("");
        this.profileForm.get(name)?.clearValidators();
        this.profileForm.get(name)?.markAsPristine();
        this.profileForm.get(name)?.updateValueAndValidity();
      });
      this.showWorkFields.set(false);
    }
    this.editWorkClick.set(false);
  }

  editWork(index: number) {
    this.editWorkClick.set(true);
    this.showWorkFields.set(true);
    const workItem = this.workExperience.value[index];

    if (workItem) {
      this.yearListEducation.forEach(entryYearWork => {
        if (
          transformYearStringToNumber(entryYearWork.value as string) === workItem.entryYearWork ||
          transformYearStringToNumber(entryYearWork.value as string) === workItem.entryYear
        ) {
          this.selectedEntryYearWorkId.set(entryYearWork.id);
        }
      });

      this.yearListEducation.forEach(complitionYearWork => {
        if (
          transformYearStringToNumber(complitionYearWork.value as string) ===
            workItem.completionYearWork ||
          transformYearStringToNumber(complitionYearWork.value as string) ===
            workItem.completionYear
        ) {
          this.selectedComplitionYearWorkId.set(complitionYearWork.id);
        }
      });

      this.profileForm.patchValue({
        organization: workItem.organization || workItem.organizationName,
        entryYearWork: workItem.entryYearWork || workItem.entryYear,
        completionYearWork: workItem.completionYearWork || workItem.completionYear,
        descriptionWork: workItem.descriptionWork || workItem.description,
        jobPosition: workItem.jobPosition,
      });
      this.editIndex.set(index);
    }
  }

  removeWork(i: number) {
    this.workItems.update(items => items.filter((_, index) => index !== i));

    this.workExperience.removeAt(i);
  }
}
