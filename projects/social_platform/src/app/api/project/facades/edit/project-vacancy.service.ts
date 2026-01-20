/** @format */

import { inject, Injectable } from "@angular/core";
import { Validators } from "@angular/forms";
import { ValidationService } from "@corelib";
import { Skill } from "../../../../domain/skills/skill";
import { VacancyService } from "../../../vacancy/vacancy.service";
import { Subject, takeUntil } from "rxjs";
import { ProjectVacancyUIService } from "./ui/project-vacancy-ui.service";
import { CreateVacancyDto } from "../../dto/create-vacancy.model";

/**
 * Сервис для управления вакансиями проекта.
 * Обеспечивает создание, валидацию, отправку,
 * редактирование и удаление вакансий, а также работу с формой вакансии
 * и синхронизацию с API.
 */
@Injectable()
export class ProjectVacancyService {
  private readonly vacancyService = inject(VacancyService);
  private readonly projectVacancyUIService = inject(ProjectVacancyUIService);
  private readonly validationService = inject(ValidationService);

  private readonly destroy$ = new Subject<void>();

  private readonly vacancyForm = this.projectVacancyUIService.vacancyForm;
  private readonly selectedSkills = this.projectVacancyUIService.selectedSkills;

  private readonly vacancyIsSubmitting = this.projectVacancyUIService.vacancyIsSubmitting;
  private readonly vacancySubmitInitiated = this.projectVacancyUIService.vacancySubmitInitiated;

  constructor() {
    this.vacancyForm
      .get("skills")
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(skills => {
        this.selectedSkills.set(skills ?? []);
      });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Отправляет форму вакансии: настраивает валидаторы, проверяет форму,
   * создаёт вакансию через API и сбрасывает форму.
   * @returns Promise<boolean> - true при успехе, false при ошибке валидации или API
   */
  public submitVacancy(projectId: number) {
    // Настройка валидаторов для обязательных полей
    this.vacancyForm.get("role")?.setValidators([Validators.required]);
    this.vacancyForm.get("skills")?.setValidators([Validators.required]);
    this.vacancyForm.get("requiredExperience")?.setValidators([Validators.required]);
    this.vacancyForm.get("workFormat")?.setValidators([Validators.required]);
    this.vacancyForm.get("workSchedule")?.setValidators([Validators.required]);
    this.vacancyForm
      .get("salary")
      ?.setValidators([Validators.pattern("^(\\d{1,3}( \\d{3})*|\\d+)$")]);

    // Обновление валидности и отображение ошибок
    Object.keys(this.vacancyForm.controls).forEach(name => {
      const ctrl = this.vacancyForm.get(name);
      ctrl?.updateValueAndValidity();
      if (["role", "skills"].includes(name)) ctrl?.markAsTouched();
    });

    this.vacancySubmitInitiated.set(true);

    // Проверка валидации формы
    if (!this.validationService.getFormValidation(this.vacancyForm)) {
      return;
    }

    // Подготовка payload для API
    this.vacancyIsSubmitting.set(true);

    const form = this.vacancyForm.value;

    const payload: CreateVacancyDto = {
      role: form.role!,
      requiredSkillsIds: (form.skills ?? []).map(s => s.id),
      description: form.description ?? "",
      requiredExperience: form.requiredExperience!,
      workFormat: form.workFormat!,
      workSchedule: form.workSchedule!,
      specialization: form.specialization ?? undefined,
      salary: typeof form.salary === "string" ? +form.salary : null,
    };

    // Вызов API для создания вакансии
    this.vacancyService
      .postVacancy(projectId, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: vacancy => {
          this.projectVacancyUIService.applySubmitVacancy(vacancy);
        },
        error: () => {
          this.vacancyIsSubmitting.set(false);
        },
      });
  }

  /**
   * Удаляет вакансию по её идентификатору с подтверждением пользователя.
   * @param vacancyId идентификатор вакансии для удаления
   */
  public removeVacancy(vacancyId: number): void {
    if (!confirm("Вы точно хотите удалить вакансию?")) return;
    this.vacancyService
      .deleteVacancy(vacancyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.projectVacancyUIService.applyRemoveVacancy(vacancyId);
      });
  }
}
