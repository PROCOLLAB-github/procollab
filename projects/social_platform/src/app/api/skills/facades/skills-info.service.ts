/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { Subject } from "rxjs";
import { Skill } from "../../../domain/skills/skill";
import { FormGroup } from "@angular/forms";
import { SkillsService } from "../skills.service";

@Injectable({ providedIn: "root" })
export class SkillsInfoService {
  private readonly skillsService = inject(SkillsService);

  private readonly destroy$ = new Subject<void>();

  readonly inlineSkills = signal<Skill[]>([]);

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Переключение навыка (добавление/удаление)
   * @param toggledSkill - навык для переключения
   */
  onToggleSkill(toggledSkill: Skill, form: FormGroup): void {
    const { skills }: { skills: Skill[] } = form.value;

    const isPresent = skills.some(skill => skill.id === toggledSkill.id);

    if (isPresent) {
      this.onRemoveSkill(toggledSkill, form);
    } else {
      this.onAddSkill(toggledSkill, form);
    }
  }

  /**
   * Добавление нового навыка
   * @param newSkill - новый навык для добавления
   */
  onAddSkill(newSkill: Skill, form: FormGroup): void {
    const { skills }: { skills: Skill[] } = form.value;

    const isPresent = skills.some(skill => skill.id === newSkill.id);

    if (isPresent) return;

    form.patchValue({ skills: [newSkill, ...skills] });
  }

  /**
   * Удаление навыка
   * @param oddSkill - навык для удаления
   */
  onRemoveSkill(oddSkill: Skill, form: FormGroup): void {
    const { skills }: { skills: Skill[] } = form.value;

    form.patchValue({ skills: skills.filter(skill => skill.id !== oddSkill.id) });
  }

  onSearchSkill(query: string): void {
    this.skillsService.getSkillsInline(query, 1000, 0).subscribe(({ results }) => {
      this.inlineSkills.set(results);
    });
  }
}
