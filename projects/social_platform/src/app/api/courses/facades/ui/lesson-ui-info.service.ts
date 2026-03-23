/** @format */

import { computed, Injectable, signal } from "@angular/core";
import { CourseLesson, Task } from "@domain/courses/courses.model";
import { AsyncState, initial, isSuccess } from "@domain/shared/async-state";

@Injectable()
export class LessonUIInfoService {
  readonly lesson$ = signal<AsyncState<CourseLesson>>(initial());
  readonly submitAnswer$ = signal<AsyncState<void>>(initial());

  readonly lessonInfo = computed(() => {
    const state = this.lesson$();
    return isSuccess(state) ? state.data : undefined;
  });

  readonly isComplete = signal<boolean>(false);
  readonly currentTaskId = signal<number | null>(null);

  /** Transition loading — управляется фасадом вручную (с setTimeout delay) */
  readonly loading = signal(false);
  readonly loader = signal(false);
  readonly success = signal(false);
  readonly hasError = signal(false);

  readonly answerBody = signal<any>(null);
  readonly completedTaskIds = signal<Set<number>>(new Set());

  readonly tasks = computed(() => this.lessonInfo()?.tasks ?? []);

  readonly currentTask = computed(() => {
    const id = this.currentTaskId();
    return this.tasks().find(t => t.id === id) ?? null;
  });

  readonly isLastTask = computed(() => {
    const allTasksLength = this.tasks().length;
    return allTasksLength === this.currentTask()?.order;
  });

  readonly isSubmitDisabled = computed(() => {
    const task = this.currentTask();
    const body = this.answerBody();
    if (!task) return true;

    switch (task.answerType) {
      case "text":
        return !body || (typeof body === "string" && !body.trim());
      case "text_and_files":
        return !body?.text?.trim() || !body?.fileUrls?.length;
      case "single_choice":
      case "multiple_choice":
        return !body || (Array.isArray(body) && body.length === 0);
      case "files":
        return !body || (Array.isArray(body) && body.length === 0);
      default:
        return false;
    }
  });

  markTaskCompleted(taskId: number): void {
    this.completedTaskIds.update(ids => new Set([...ids, taskId]));
  }

  isDone(task: Task): boolean {
    return task.isCompleted || this.completedTaskIds().has(task.id);
  }
}
