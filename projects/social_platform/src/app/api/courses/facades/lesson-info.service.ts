/** @format */

import { inject, Injectable } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter, map, Subject, takeUntil } from "rxjs";
import { CourseLesson, Task } from "@domain/courses/courses.model";
import { LessonUIInfoService } from "./ui/lesson-ui-info.service";
import { SubmitTaskAnswerUseCase } from "../use-cases/submit-task-answer.use-case";
import { SnackbarService } from "@ui/services/snackbar/snackbar.service";
import { failure, loading, success } from "@domain/shared/async-state";

@Injectable()
export class LessonInfoService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly submitTaskAnswerUseCase = inject(SubmitTaskAnswerUseCase);
  private readonly snackbarService = inject(SnackbarService);
  private readonly lessonUIInfoService = inject(LessonUIInfoService);

  private readonly destroy$ = new Subject<void>();

  init(): void {
    this.loadLessonData();
    this.trackNavigation();
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAnswerChange(value: any): void {
    this.lessonUIInfoService.answerBody.set(value);
  }

  onSubmitAnswer(): void {
    const task = this.lessonUIInfoService.currentTask();
    if (!task) return;

    this.lessonUIInfoService.loader.set(true);
    this.lessonUIInfoService.submitAnswer$.set(loading());

    const body = this.lessonUIInfoService.answerBody();
    const isTextFile = task.answerType === "text_and_files";
    const answerText = task.answerType === "text" || isTextFile ? body?.text : undefined;
    const optionIds =
      task.answerType === "single_choice" || task.answerType === "multiple_choice"
        ? body
        : undefined;
    const fileIds = task.answerType === "files" ? body : isTextFile ? body?.fileUrls : undefined;

    this.submitTaskAnswerUseCase
      .execute(task.id, answerText, optionIds, fileIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          this.lessonUIInfoService.loader.set(false);

          if (!result.ok) {
            this.lessonUIInfoService.hasError.set(true);
            this.lessonUIInfoService.submitAnswer$.set(failure("submit_error"));
            this.snackbarService.error("неверный ответ, попробуйте еще раз!");
            return;
          }

          const res = result.value;
          this.lessonUIInfoService.submitAnswer$.set(success(undefined));

          if (res.isCorrect) {
            this.lessonUIInfoService.success.set(true);
            this.lessonUIInfoService.hasError.set(false);
            this.lessonUIInfoService.markTaskCompleted(task.id);
            this.snackbarService.success("правильный ответ, продолжайте дальше");
          } else {
            this.lessonUIInfoService.hasError.set(true);
            this.lessonUIInfoService.success.set(false);
            this.snackbarService.error("неверный ответ, попробуйте еще раз!");
            setTimeout(() => this.lessonUIInfoService.hasError.set(false), 1000);
            return;
          }

          if (!res.canContinue) return;

          setTimeout(() => {
            const nextId = res.nextTaskId ?? this.getNextTask()?.id ?? null;

            if (nextId) {
              this.lessonUIInfoService.currentTaskId.set(nextId);
              this.lessonUIInfoService.success.set(false);
              this.lessonUIInfoService.answerBody.set(null);
            } else {
              this.router.navigate(["results"], { relativeTo: this.route });
            }
          }, 1000);
        },
        error: () => {
          this.lessonUIInfoService.loader.set(false);
          this.lessonUIInfoService.hasError.set(true);
          this.lessonUIInfoService.submitAnswer$.set(failure("submit_error"));
          this.snackbarService.error("неверный ответ, попробуйте еще раз!");
        },
      });
  }

  private loadLessonData(): void {
    this.route.data
      .pipe(
        map(data => data["data"] as CourseLesson | null),
        filter((lessonInfo): lessonInfo is CourseLesson => !!lessonInfo),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: lessonInfo => {
          this.lessonUIInfoService.loading.set(true);
          this.lessonUIInfoService.lesson$.set(success(lessonInfo));

          if (lessonInfo.progressStatus === "completed") {
            setTimeout(() => {
              this.lessonUIInfoService.loading.set(false);
              this.router.navigate(["results"], { relativeTo: this.route });
            }, 500);
            return;
          }

          const nextTaskId =
            lessonInfo.currentTaskId ??
            lessonInfo.tasks.find(t => t.isAvailable && !t.isCompleted)?.id ??
            null;

          const allCompleted = lessonInfo.tasks.every(t => t.isCompleted);
          const onResultsPage = this.router.url.includes("results");

          if (onResultsPage && !allCompleted) {
            this.lessonUIInfoService.currentTaskId.set(nextTaskId);
            setTimeout(() => {
              this.lessonUIInfoService.loading.set(false);
              this.router.navigate(["./"], { relativeTo: this.route });
            }, 500);
          } else if (nextTaskId === null && allCompleted) {
            setTimeout(() => {
              this.lessonUIInfoService.loading.set(false);
              this.router.navigate(["results"], { relativeTo: this.route });
            }, 500);
          } else {
            this.lessonUIInfoService.currentTaskId.set(nextTaskId);
            setTimeout(() => this.lessonUIInfoService.loading.set(false), 500);
          }
        },
        complete: () => {
          setTimeout(() => this.lessonUIInfoService.loading.set(false), 500);
        },
      });
  }

  private trackNavigation(): void {
    this.lessonUIInfoService.isComplete.set(this.router.url.includes("results"));

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.lessonUIInfoService.isComplete.set(this.router.url.includes("results"));
      });
  }

  private getNextTask(): Task | null {
    const currentId = this.lessonUIInfoService.currentTaskId();
    const allTasks = this.lessonUIInfoService.tasks();
    const currentIndex = allTasks.findIndex(t => t.id === currentId);
    return allTasks.slice(currentIndex + 1).find(t => t.isAvailable && !t.isCompleted) ?? null;
  }
}
