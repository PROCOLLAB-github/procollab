/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { NonNullableFormBuilder } from "@angular/forms";
import { UserInput } from "@domain/auth/user.model";
import { Skill } from "@domain/skills/skill.model";

/** UI-состояние этапа 2 онбординга: выбор навыков, раскрытие групп. */
@Injectable()
export class OnboardingStageTwoUIInfoService {
  private readonly nnFb = inject(NonNullableFormBuilder);

  readonly isChooseSkill = signal<boolean>(false);
  readonly isChooseSkillText = signal<string>("");

  readonly searchedSkills = signal<Skill[]>([]);

  readonly openSkillGroup = signal<string | null>(null);

  readonly stageForm = this.nnFb.group({
    skills: this.nnFb.control<Skill[]>([]),
  });

  /**
   * Проверяет, есть ли открытые группы навыков
   */
  hasOpenSkillsGroups(): boolean {
    return this.openSkillGroup() !== null;
  }

  /**
   * Обработчик переключения группы навыков
   * @param skillName - название навыка
   * @param isOpen - флаг открытия/закрытия группы
   */
  onSkillGroupToggled(isOpen: boolean, skillName: string): void {
    this.openSkillGroup.set(isOpen ? skillName : null);
  }

  /**
   * Проверяет, должна ли группа навыков быть отключена
   * @param skillName - название навыка
   */
  isSkillGroupDisabled(skillName: string): boolean {
    return this.openSkillGroup() !== null && this.openSkillGroup() !== skillName;
  }

  applyInitFormValues(skills: Skill[] | undefined): void {
    this.stageForm.patchValue({ skills: skills ?? [] });
  }

  applyInitSkills(fv: UserInput): void {
    this.stageForm.patchValue({ skills: fv.skills });
  }

  applySubmitErrorModal(err: any): void {
    if (err.status === 400) {
      this.isChooseSkill.set(true);
      this.isChooseSkillText.set(err.error[0]);
    }
  }
}
