/**
 * Сервис для управления шагами редактирования проекта.
 * Обеспечивает хранение текущего шага, навигацию между шагами и синхронизацию
 * состояния с URL-параметрами маршрута.
 *
 * @format
 */

import { inject, Injectable, Signal, signal } from "@angular/core";
import { Router } from "@angular/router";

/** Тип шага редактирования проекта */
export type EditStep = "main" | "contacts" | "achievements" | "vacancies" | "team" | "additional";

@Injectable({
  providedIn: "root",
})
export class ProjectStepService {
  /** Сигнал, содержащий текущий шаг редактирования */
  private currentStep = signal<EditStep>("main");
  /** Ссылка на Router для изменения URL */
  private readonly router = inject(Router);

  /**
   * Возвращает readonly-сигнал текущего шага.
   * @returns Signal<EditStep> readonly-сигнал
   */
  public getCurrentStep(): Signal<EditStep> {
    return this.currentStep.asReadonly();
  }

  /**
   * Устанавливает новый шаг и синхронизирует его с query-параметрами URL.
   * @param step новый шаг редактирования
   */
  public navigateToStep(step: EditStep): void {
    this.currentStep.set(step);
    this.router.navigate([], {
      queryParams: { editingStep: step },
      queryParamsHandling: "merge",
    });
  }

  /**
   * Устанавливает шаг из параметра маршрута. Если передан некорректный шаг,
   * по умолчанию выбирает 'main' и обновляет URL.
   * @param step строка из URL или валидный EditStep
   */
  public setStepFromRoute(step: string | EditStep): void {
    const validSteps: EditStep[] = [
      "main",
      "contacts",
      "achievements",
      "vacancies",
      "team",
      "additional",
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
