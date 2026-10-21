/** @format */

import { computed, DestroyRef, inject, Injectable, signal } from "@angular/core";
import { Validators } from "@angular/forms";
import { ValidationService } from "@corelib";
import { ProjectVacancyUIService } from "./ui/project-vacancy-ui.service";
import { CreateVacancyDto } from "../../../../domain/vacancy/dto/create-vacancy.model";
import { ProjectFormService } from "./project-form.service";
import { UpdateVacancyUseCase } from "../../../vacancy/use-cases/update-vacancy.use-case";
import { PostVacancyUseCase } from "../../../vacancy/use-cases/post-vacancy.use-case";
import { DeleteVacancyUseCase } from "../../../vacancy/use-cases/delete-vacancy.use-case";
import { failure, initial, loading } from "@domain/shared/async-state";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize, Observable } from "rxjs";
import { Result } from "@domain/shared/result.type";
import { Vacancy } from "@domain/vacancy/vacancy.model";

type VacancyActionKind = "archive" | "restore" | "delete" | "blocked-delete";
interface VacancyAction {
  kind: VacancyActionKind;
  vacancy: Vacancy;
}

/** Сервис для управления вакансиями проекта. */
@Injectable()
export class ProjectVacancyService {
  private readonly validationService = inject(ValidationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly projectVacancyUIService = inject(ProjectVacancyUIService);
  private readonly projectFormService = inject(ProjectFormService);

  private readonly updateVacancyUseCase = inject(UpdateVacancyUseCase);
  private readonly postVacancyUseCase = inject(PostVacancyUseCase);
  private readonly deleteVacancyUseCase = inject(DeleteVacancyUseCase);

  private readonly vacancyForm = this.projectVacancyUIService.vacancyForm;
  private readonly selectedSkills = this.projectVacancyUIService.selectedSkills;

  private readonly vacancyIsSubmitting = this.projectVacancyUIService.vacancyIsSubmitting;
  private readonly vacancySubmitInitiated = this.projectVacancyUIService.vacancySubmitInitiated;

  readonly action = signal<VacancyAction | null>(null);
  readonly actionBusy = signal(false);
  readonly actionError = signal<string | null>(null);
  readonly actionSuccess = signal("");
  readonly activeTab = signal<"active" | "archived">("active");
  readonly activeVacancies = computed(() =>
    this.projectVacancyUIService.vacancies().filter(v => v.isActive),
  );
  readonly archivedVacancies = computed(() =>
    this.projectVacancyUIService.vacancies().filter(v => !v.isActive),
  );
  readonly visibleVacancies = computed(() =>
    this.activeTab() === "active" ? this.activeVacancies() : this.archivedVacancies(),
  );
  readonly actionTitle = computed(() => {
    switch (this.action()?.kind) {
      case "archive":
        return "Перенести вакансию в архив?";
      case "restore":
        return "Вернуть вакансию в активные?";
      case "delete":
        return "Удалить вакансию?";
      default:
        return "Вакансию нельзя удалить";
    }
  });
  readonly actionLabel = computed(() => {
    const action = this.action();
    if (action?.kind === "restore") return "Вернуть в активные";
    if (action?.kind === "delete") return "Удалить вакансию";
    if (action?.kind === "blocked-delete" && !action.vacancy.isActive) return "Понятно";
    return "Перенести в архив";
  });

  constructor() {
    this.vacancyForm
      .get("skills")
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(skills => {
        this.selectedSkills.set(skills ?? []);
      });
  }

  public submitVacancy(projectId: number) {
    if (this.projectVacancyUIService.vacancyIsSubmittingFlag() || this.actionBusy()) return;
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
    this.vacancyIsSubmitting.set(loading());

    const form = this.vacancyForm.value;

    const payload: CreateVacancyDto = {
      role: form.role!,
      requiredSkillsIds: (form.skills ?? []).map(s => s.id),
      description: form.description ?? "",
      requiredExperience: form.requiredExperience!,
      workFormat: form.workFormat!,
      city: this.projectVacancyUIService.isCityRequired() ? form.city?.trim() || null : null,
      workSchedule: form.workSchedule!,
      specialization: form.specialization ?? undefined,
      salary: form.salary ? Number(form.salary.replace(/ /g, "")) : null,
    };

    const editIdx = this.projectFormService.editIndex();
    if (editIdx !== null) {
      const editedVacancy = this.projectVacancyUIService.vacancies()[editIdx];
      if (!editedVacancy?.id) {
        this.vacancyIsSubmitting.set(initial());
        return;
      }

      this.updateVacancyUseCase
        .execute(editedVacancy.id, payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: result => {
            if (!result.ok) {
              this.vacancyIsSubmitting.set(failure("vacancy_error"));
              return;
            }

            this.projectVacancyUIService.applyUpdateVacancy(result.value);
          },
          error: () => this.vacancyIsSubmitting.set(failure("vacancy_error")),
        });
      return;
    }

    // Вызов API для создания вакансии
    this.postVacancyUseCase
      .execute(projectId, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.vacancyIsSubmitting.set(failure("vacancy_error"));
            return;
          }

          this.projectVacancyUIService.applySubmitVacancy(result.value);
        },
        error: () => this.vacancyIsSubmitting.set(failure("vacancy_error")),
      });
  }

  public removeVacancy(vacancyId: number): void {
    this.openAction(vacancyId, "delete");
  }

  changeVacancyStatus(vacancyId: number): void {
    const vacancy = this.projectVacancyUIService.vacancies().find(v => v.id === vacancyId);
    if (vacancy) this.openAction(vacancyId, vacancy.isActive ? "archive" : "restore");
  }

  closeAction(): void {
    if (this.actionBusy()) return;
    this.action.set(null);
    this.actionError.set(null);
  }

  private openAction(vacancyId: number, kind: VacancyActionKind): void {
    if (this.actionBusy() || this.projectVacancyUIService.vacancyIsSubmittingFlag()) return;
    const vacancy = this.projectVacancyUIService.vacancies().find(v => v.id === vacancyId);
    if (!vacancy) return;
    const hasResponses = (vacancy.totalResponseCount ?? vacancy.responseCount ?? 0) > 0;
    this.action.set({ kind: kind === "delete" && hasResponses ? "blocked-delete" : kind, vacancy });
    this.actionError.set(null);
    this.actionSuccess.set("");
  }

  confirmAction(): void {
    const action = this.action();
    if (!action || this.actionBusy() || this.projectVacancyUIService.vacancyIsSubmittingFlag())
      return;
    if (action.kind === "blocked-delete" && !action.vacancy.isActive) {
      this.closeAction();
      return;
    }
    const current = this.projectVacancyUIService.vacancies().find(v => v.id === action.vacancy.id);
    if (!current) {
      this.actionError.set("Вакансия больше недоступна. Обновите страницу проекта.");
      return;
    }
    if (
      action.kind === "delete" &&
      (current.totalResponseCount ?? current.responseCount ?? 0) > 0
    ) {
      this.action.set({ kind: "blocked-delete", vacancy: current });
      return;
    }
    const kind = action.kind === "blocked-delete" ? "archive" : action.kind;
    this.actionBusy.set(true);
    this.actionError.set(null);
    const request: Observable<Result<Vacancy | void, { cause?: unknown }>> =
      kind === "delete"
        ? this.deleteVacancyUseCase.execute(current.id)
        : this.updateVacancyUseCase.execute(current.id, { isActive: kind === "restore" });
    request
      .pipe(
        finalize(() => this.actionBusy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.handleActionError(result.error.cause, kind);
            return;
          }
          if (kind === "delete") this.projectVacancyUIService.applyRemoveVacancy(current.id);
          else this.projectVacancyUIService.applyLifecycleVacancy(result.value as Vacancy);
          this.actionSuccess.set(
            kind === "delete"
              ? "Вакансия удалена"
              : kind === "restore"
                ? "Вакансия возвращена в активные"
                : "Вакансия перенесена в архив. История откликов сохранена.",
          );
          this.action.set(null);
        },
        error: error => this.handleActionError(error, kind),
      });
  }

  private handleActionError(error: unknown, kind: string): void {
    const response = error as { status?: number; error?: Record<string, unknown> } | null;
    const body = response?.error;
    const code = body?.["code"];
    if (
      kind === "delete" &&
      (code === "vacancy_has_responses" ||
        (Array.isArray(code) && code.includes("vacancy_has_responses")))
    ) {
      const current = this.action();
      if (current) this.action.set({ ...current, kind: "blocked-delete" });
      return;
    }
    const detail = body?.["is_active"];
    this.actionError.set(
      response?.status === 403
        ? "Нет доступа к управлению этой вакансией. Обратитесь к руководителю проекта."
        : response?.status === 404
          ? "Вакансия больше недоступна. Обновите страницу проекта."
          : typeof detail === "string"
            ? detail
            : Array.isArray(detail) && typeof detail[0] === "string"
              ? detail[0]
              : "Не удалось выполнить действие. Вакансия не изменена. Проверьте соединение и повторите попытку.",
    );
  }
}
