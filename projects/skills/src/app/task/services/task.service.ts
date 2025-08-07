/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { SkillsApiService } from "@corelib";
import { TaskResults, TaskStep, TaskStepsResponse } from "../../../models/skill.model";
import { Observable, tap } from "rxjs";
import { StepType } from "../../../models/step.model";

/**
 * Сервис заданий
 *
 * Управляет всеми операциями, связанными с заданиями, включая:
 * - Навигацию по шагам заданий и управление состоянием
 * - Получение и отправку данных шагов
 * - Отслеживание прогресса в рамках заданий
 * - Завершение заданий и обработку результатов
 *
 * Этот сервис поддерживает текущее состояние прогресса задания
 * и предоставляет методы для взаимодействия с отдельными шагами заданий.
 */
@Injectable({
  providedIn: "root",
})
export class TaskService {
  private readonly TASK_URL = "/questions";
  private readonly SKILLS_URL = "/courses";

  private apiService = inject(SkillsApiService);

  // Реактивное управление состоянием с использованием Angular signals
  currentSteps = signal<TaskStepsResponse["stepData"]>([]);
  currentTaskDone = signal(false);

  /**
   * Сопоставление типов шагов с соответствующими конечными точками API
   * Используется для построения правильных маршрутов API для различных типов вопросов
   */
  private readonly stepRouteMapping: Record<TaskStep["type"], string> = {
    question_connect: "connect",
    exclude_question: "exclude",
    info_slide: "info-slide",
    question_single_answer: "single-correct",
    question_write: "write",
  };

  /**
   * Получает конкретный шаг по его ID из массива текущих шагов
   *
   * @param stepId - Уникальный идентификатор шага
   * @returns TaskStep | undefined - Данные шага или undefined, если не найден
   */
  getStep(stepId: number): TaskStep | undefined {
    return this.currentSteps().find(s => s.id === stepId);
  }

  /**
   * Находит следующий шаг в последовательности после данного ID шага
   *
   * @param stepId - ID текущего шага
   * @returns TaskStep | undefined - Следующий шаг в последовательности или undefined, если это последний шаг
   */
  getNextStep(stepId: number): TaskStep | undefined {
    const step = this.getStep(stepId);
    if (!step) return;

    return this.currentSteps().find(s => s.ordinalNumber === step.ordinalNumber + 1);
  }

  /**
   * Получает все шаги для данного задания и обновляет состояние текущих шагов
   *
   * @param taskId - Уникальный идентификатор задания
   * @returns Observable<TaskStepsResponse> - Полная информация о задании со всеми шагами
   */
  fetchSteps(taskId: number) {
    return this.apiService.get<TaskStepsResponse>(`${this.SKILLS_URL}/${taskId}`).pipe(
      tap(res => {
        this.currentSteps.set(res.stepData);
      })
    );
  }

  /**
   * Получает подробные данные для конкретного шага задания
   *
   * @param taskStepId - Уникальный идентификатор шага задания
   * @param taskStepType - Тип шага (определяет, какую конечную точку использовать)
   * @returns Observable<StepType> - Данные, специфичные для шага, основанные на типе шага
   */
  fetchStep(taskStepId: TaskStep["id"], taskStepType: TaskStep["type"]): Observable<StepType> {
    const route = `${this.TASK_URL}/${this.stepRouteMapping[taskStepType]}/${taskStepId}`;
    return this.apiService.get<StepType>(route);
  }

  /**
   * Отправляет ответ для конкретного шага задания и проверяет ответ
   *
   * @param taskStepId - Уникальный идентификатор шага задания
   * @param taskStepType - Тип шага (определяет логику проверки)
   * @param body - Данные ответа (структура варьируется в зависимости от типа шага)
   * @returns Observable<void> - Успешный ответ или ошибка с обратной связью
   */
  checkStep(taskStepId: TaskStep["id"], taskStepType: TaskStep["type"], body: any) {
    const route = `${this.TASK_URL}/${this.stepRouteMapping[taskStepType]}/check/${taskStepId}`;
    return this.apiService.post<void>(route, body);
  }

  /**
   * Получает финальные результаты после завершения всех шагов в задании
   *
   * @param taskId - Уникальный идентификатор завершенного задания
   * @returns Observable<TaskResults> - Сводка производительности, заработанных очков и следующих шагов
   */
  fetchResults(taskId: number) {
    return this.apiService.get<TaskResults>(`${this.SKILLS_URL}/task-result/${taskId}`);
  }
}
