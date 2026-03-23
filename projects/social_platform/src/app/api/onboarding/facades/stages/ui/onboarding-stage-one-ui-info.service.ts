/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { NonNullableFormBuilder } from "@angular/forms";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";

@Injectable()
export class OnboardingStageOneUIInfoService {
  private readonly nnFb = inject(NonNullableFormBuilder);

  // Для управления открытыми группами специализаций
  readonly openSpecializationGroup = signal<string | null>(null);

  readonly stageForm = this.nnFb.group({
    speciality: [""],
  });

  /**
   * Проверяет, есть ли открытые группы специализаций
   */
  hasOpenSpecializationsGroups(): boolean {
    return this.openSpecializationGroup() !== null;
  }

  /**
   * Обработчик переключения группы специализаций
   * @param isOpen - флаг открытия/закрытия группы
   * @param groupName - название группы
   */
  onSpecializationsGroupToggled(isOpen: boolean, groupName: string): void {
    this.openSpecializationGroup.set(isOpen ? groupName : null);
  }

  /**
   * Проверяет, должна ли группа специализаций быть отключена
   * @param groupName - название группы для проверки
   */
  isSpecializationGroupDisabled(groupName: string): boolean {
    return this.openSpecializationGroup() !== null && this.openSpecializationGroup() !== groupName;
  }

  applyInitFormValues(fv: Partial<User>): void {
    this.stageForm.patchValue({
      speciality: fv.speciality,
    });
  }

  applyInitSpeciality(fv: Partial<User>): void {
    this.stageForm.patchValue({ speciality: fv.speciality });
  }
}
