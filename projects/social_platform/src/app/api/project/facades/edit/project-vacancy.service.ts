/** @format */

import { inject, Injectable } from "@angular/core";
import { Validators } from "@angular/forms";
import { ValidationService } from "@corelib";
import { Subject, takeUntil } from "rxjs";
import { ProjectVacancyUIService } from "./ui/project-vacancy-ui.service";
import { CreateVacancyDto } from "../../dto/create-vacancy.model";
import { ProjectFormService } from "./project-form.service";
import { UpdateVacancyUseCase } from "../../../vacancy/use-cases/update-vacancy.use-case";
import { PostVacancyUseCase } from "../../../vacancy/use-cases/post-vacancy.use-case";
import { DeleteVacancyUseCase } from "../../../vacancy/use-cases/delete-vacancy.use-case";

/**
 * Сервис для управления вакансиями проекта.
 * Обеспечивает создание, валидацию, отправку,
 * редактирование и удаление вакансий, а также работу с формой вакансии
 * и синхронизацию с API.
 */
@Injectable()
export class ProjectVacancyService {
  private readonly projectVacancyUIService = inject(ProjectVacancyUIService);
  private readonly validationService = inject(ValidationService);
  private readonly projectFormService = inject(ProjectFormService);
  private readonly updateVacancyUseCase = inject(UpdateVacancyUseCase);
  private readonly postVacancyUseCase = inject(PostVacancyUseCase);
  private readonly deleteVacancyUseCase = inject(DeleteVacancyUseCase);

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

    const editIdx = this.projectFormService.editIndex();
    if (editIdx !== null) {
      const editedVacancy = this.projectVacancyUIService.vacancies()[editIdx];
      if (!editedVacancy?.id) {
        this.vacancyIsSubmitting.set(false);
        return;
      }

      this.updateVacancyUseCase
        .execute(editedVacancy.id, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: result => {
            if (!result.ok) {
              this.vacancyIsSubmitting.set(false);
              return;
            }

            this.projectVacancyUIService.applyUpdateVacancy(result.value);
          },
        });
      return;
    }

    // Вызов API для создания вакансии
    this.postVacancyUseCase
      .execute(projectId, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.vacancyIsSubmitting.set(false);
            return;
          }

          this.projectVacancyUIService.applySubmitVacancy(result.value);
        },
      });
  }

  /**
   * Удаляет вакансию по её идентификатору с подтверждением пользователя.
   * @param vacancyId идентификатор вакансии для удаления
   */
  public removeVacancy(vacancyId: number): void {
    if (!confirm("Вы точно хотите удалить вакансию?")) return;
    this.deleteVacancyUseCase
      .execute(vacancyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (!result.ok) return;

        this.projectVacancyUIService.applyRemoveVacancy(vacancyId);
      });
  }
}
