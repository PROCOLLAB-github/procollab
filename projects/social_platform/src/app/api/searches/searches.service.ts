/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { Observable, of, Subject, take, takeUntil } from "rxjs";
import { Specialization } from "@domain/specializations/specialization.model";
import { FormGroup } from "@angular/forms";
import { Skill } from "@domain/skills/skill.model";
import { SkillsGroup } from "@domain/skills/skills-group.model";
import { SkillsRepositoryPort } from "@domain/skills/ports/skills.repository.port";
import { GetSpecializationsInlineUseCase } from "@api/specializations/use-cases/get-specializations-inline.use-case";
import { fail } from "@domain/shared/result.type";

/** Сервис подбора навыков/специализаций для форм: поиск, добавление/удаление, inline-специализации. */
@Injectable({ providedIn: "root" })
export class SearchesService {
  private readonly skillsRepository = inject(SkillsRepositoryPort);
  private readonly getSpecializationsInlineUseCase = inject(GetSpecializationsInlineUseCase);

  readonly inlineSpecs = signal<Specialization[]>([]);
  readonly inlineSkills = signal<Skill[]>([]);

  private readonly destroy$ = new Subject<void>();

  onSelectSpec(form: FormGroup, speciality: Specialization): void {
    form.patchValue({ speciality: speciality.name });
  }

  onSearchSpec(query: string): void {
    this.getSpecializationsInlineUseCase
      .execute(query, 1000, 0)
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(result => {
        if (!result.ok) return of(fail(null));

        return this.inlineSpecs.set(result.value.results);
      });
  }

  getSkillsNested(): Observable<SkillsGroup[]> {
    return this.skillsRepository.getSkillsNested();
  }

  onToggleSkill(toggledSkill: Skill, form: FormGroup): void {
    const { skills }: { skills: Skill[] } = form.value;

    const isPresent = skills.some(skill => skill.id === toggledSkill.id);

    if (isPresent) {
      this.onRemoveSkill(toggledSkill, form);
    } else {
      this.onAddSkill(toggledSkill, form);
    }
  }

  onAddSkill(newSkill: Skill, form: FormGroup): void {
    const { skills }: { skills: Skill[] } = form.value;

    const isPresent = skills.some(skill => skill.id === newSkill.id);

    if (isPresent) return;

    form.patchValue({ skills: [newSkill, ...skills] });
  }

  onRemoveSkill(oddSkill: Skill, form: FormGroup): void {
    const { skills }: { skills: Skill[] } = form.value;

    form.patchValue({ skills: skills.filter(skill => skill.id !== oddSkill.id) });
  }

  onSearchSkill(query: string): void {
    this.skillsRepository.getSkillsInline(query, 1000, 0).subscribe(({ results }) => {
      this.inlineSkills.set(results);
    });
  }
}
