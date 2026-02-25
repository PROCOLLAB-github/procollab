/** @format */

import {
  Component,
  computed,
  DestroyRef,
  effect,
  type ElementRef,
  inject,
  type OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { filter, map } from "rxjs";
import { TaskService } from "../services/task.service";
import { TaskStepsResponse } from "@office/models/task.model";

/**
 * Компонент задания
 *
 * Основной контейнерный компонент для выполнения заданий и навигации.
 * Управляет общим потоком задания, визуализацией прогресса и навигацией по шагам.
 *
 * Функции:
 * - Визуальная полоса прогресса, показывающая статус завершения
 * - Пошаговая навигация через компоненты задания
 * - Автоматическая маршрутизация к следующим шагам при завершении
 * - Отслеживание прогресса и управление состоянием
 *
 * Компонент использует Angular signals для реактивного управления состоянием
 * и эффекты для побочных эффектов, таких как манипуляции с DOM и маршрутизация.
 */
@Component({
  selector: "app-task",
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: "./task.component.html",
  styleUrl: "./task.component.scss",
})
export class TaskComponent implements OnInit {
  @ViewChild("progressDone") progressDone?: ElementRef<HTMLElement>;

  // Внедренные сервисы
  route = inject(ActivatedRoute);
  router = inject(Router);
  taskService = inject(TaskService);
  destroyRef = inject(DestroyRef);

  // Реактивное состояние
  skillStepsResponse = signal<TaskStepsResponse | null>(null);
  isComplete = signal<boolean>(false);

  constructor() {
    /**
     * Эффект для определения текущего активного шага
     * Устанавливает текущий шаг на основе статуса завершения и порядка шагов
     */
    effect(
      () => {
        const skillsResponse = this.skillStepsResponse();
        if (!skillsResponse) return;

        const sortedSteps = skillsResponse.stepData.sort((prev, next) => prev.id - next.id);

        const doneSteps = sortedSteps.filter(step => step.isDone);
        if (doneSteps.length === sortedSteps.length) return;

        // Найти следующий незавершенный шаг
        const lastDoneStep = sortedSteps[doneSteps.length];
        if (lastDoneStep) {
          this.currentSubTaskId.set(lastDoneStep.id);
          return;
        }

        // Если никакие шаги не выполнены, начать с первого шага
        const firstStep = sortedSteps[0];
        this.currentSubTaskId.set(firstStep.id);
      },
      { allowSignalWrites: true }
    );

    /**
     * Эффект для автоматической навигации к текущему шагу
     * Обновляет маршрут при изменении текущего шага
     */
    effect(() => {
      const subTaskId = this.currentSubTaskId();
      if (!subTaskId || isNaN(subTaskId)) return;

      this.router.navigate([subTaskId], {
        relativeTo: this.route,
        queryParams: { type: this.currentSubTask()?.type ?? "" },
      });
    });
  }

  ngOnInit() {
    // Загрузка данных шагов задания из резолвера маршрута
    this.route.data.pipe(map(r => r["data"])).subscribe((res: TaskStepsResponse) => {
      this.taskService.clearCompletedSteps();
      this.skillStepsResponse.set(res);

      // Проверка, завершены ли все шаги, и перенаправление к результатам
      if (res.stepData.filter(s => s.isDone).length === res.stepData.length) {
        this.taskService.currentTaskDone.set(true);
        this.router.navigate(["results"], { relativeTo: this.route });
      }
    });

    // Прослушивание изменений параметров маршрута для обновления текущего шага
    this.route.firstChild?.params
      .pipe(
        map(r => r["subTaskId"]),
        map(Number)
      )
      .subscribe(s => {
        if (!isNaN(s)) {
          this.currentSubTaskId.set(s);
        }
      });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.isComplete.set(this.router.url.includes("results"));
      });

    this.isComplete.set(this.router.url.includes("results"));
  }

  /**
   * Вычисляемый массив всех ID шагов задания
   */
  taskIds = computed(() => {
    const stepsResponse = this.skillStepsResponse();
    if (!stepsResponse) return [];

    return stepsResponse.stepData.map(s => s.id);
  });

  currentSubTaskId = signal<number | null>(null);

  /**
   * Вычисляемые данные текущего шага
   */
  currentSubTask = computed(() => {
    const stepsResponse = this.skillStepsResponse();
    const subTaskId = this.currentSubTaskId();

    if (!stepsResponse || !subTaskId) return;

    return stepsResponse.stepData.find(step => step.id === subTaskId);
  });

  /**
   * Вычисляемый массив завершенных ID заданий для визуализации прогресса
   */
  doneTasks = computed(() => {
    const stepsResponse = this.skillStepsResponse();
    if (!stepsResponse) return [];

    const serverDone = stepsResponse.stepData.filter(step => step.isDone).map(step => step.id);

    const localDone = [...this.taskService.completedStepIds()];

    return [...new Set([...serverDone, ...localDone])];
  });
}
