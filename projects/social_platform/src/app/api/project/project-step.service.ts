/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { EditStep } from "@core/lib/models/edit-step";

/** Состояние шагов мастера проекта и навигация между ними. */
@Injectable({
  providedIn: "root",
})
export class ProjectStepService {
  readonly currentStep = signal<EditStep>("main");
  private readonly router = inject(Router);

  public navigateToStep(step: EditStep): void {
    this.currentStep.set(step);
    this.router.navigate([], {
      queryParams: { editingStep: step },
      queryParamsHandling: "merge",
    });
  }

  public setStepFromRoute(step: string | EditStep): void {
    const validSteps: EditStep[] = [
      "main",
      "contacts",
      "achievements",
      "vacancies",
      "team",
      "additional",
      "education",
      "experience",
      "skills",
      "settings",
    ];

    if (step && validSteps.includes(step as EditStep)) {
      // Устанавливаем корректный шаг без изменения URL
      this.currentStep.set(step as EditStep);
    } else {
      // Сбрасываем на основной шаг и обновляем URL
      this.currentStep.set("main");
      this.router.navigate([], {
        queryParams: { editingStep: "main" },
        queryParamsHandling: "merge",
      });
    }
  }
}
