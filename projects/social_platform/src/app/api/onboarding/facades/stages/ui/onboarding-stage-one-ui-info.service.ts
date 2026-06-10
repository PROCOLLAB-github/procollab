/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { NonNullableFormBuilder } from "@angular/forms";
import { UserInput } from "@domain/auth/user.model";

/** UI-состояние этапа 1 онбординга: выбор специализаций, раскрытие групп. */
@Injectable()
export class OnboardingStageOneUIInfoService {
  private readonly nnFb = inject(NonNullableFormBuilder);

  // Для управления открытыми группами специализаций
  readonly openSpecializationGroup = signal<string | null>(null);

  readonly stageForm = this.nnFb.group({
    speciality: [""],
  });

  hasOpenSpecializationsGroups(): boolean {
    return this.openSpecializationGroup() !== null;
  }

  onSpecializationsGroupToggled(isOpen: boolean, groupName: string): void {
    this.openSpecializationGroup.set(isOpen ? groupName : null);
  }

  isSpecializationGroupDisabled(groupName: string): boolean {
    return this.openSpecializationGroup() !== null && this.openSpecializationGroup() !== groupName;
  }

  applyInitFormValues(fv: UserInput): void {
    this.stageForm.patchValue({
      speciality: fv.speciality,
    });
  }

  applyInitSpeciality(fv: UserInput): void {
    this.stageForm.patchValue({ speciality: fv.speciality });
  }
}
