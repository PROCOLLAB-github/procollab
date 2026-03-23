/** @format */

import { Component, computed, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { filter, map, tap } from "rxjs";
import { CourseLesson, Task } from "@domain/project/courses.model";
import { ButtonComponent } from "@ui/components";
import { InfoTaskComponent } from "./shared/video-task/info-task.component";
import { WriteTaskComponent } from "./shared/write-task/write-task.component";
import { ExcludeTaskComponent } from "./shared/exclude-task/exclude-task.component";
import { RadioSelectTaskComponent } from "./shared/radio-select-task/radio-select-task.component";
import { FileTaskComponent } from "./shared/file-task/file-task.component";
import { LoaderComponent } from "@ui/components/loader/loader.component";
import { SnackbarService } from "@ui/services/snackbar/snackbar.service";
import { CoursesHttpAdapter } from "@infrastructure/adapters/courses/courses-http.adapter";

@Component({
  selector: "app-lesson",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ButtonComponent,
    InfoTaskComponent,
    WriteTaskComponent,
    ExcludeTaskComponent,
    RadioSelectTaskComponent,
    FileTaskComponent,
    LoaderComponent,
  ],
  templateUrl: "./lesson.component.html",
  styleUrl: "./lesson.component.scss",
})
export class LessonComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly coursesAdapter = inject(CoursesHttpAdapter);
  private readonly snackbarService = inject(SnackbarService);

  protected readonly lessonInfo = signal<CourseLesson | undefined>(undefined);
  protected readonly isComplete = signal<boolean>(false);
  protected readonly currentTaskId = signal<number | null>(null);

  protected readonly loader = signal(false);
  protected readonly loading = signal(false);
  protected readonly success = signal(false);

  protected readonly answerBody = signal<any>(null);
  protected readonly hasError = signal(false);
  protected readonly completedTaskIds = signal<Set<number>>(new Set());

  protected readonly tasks = computed(() => this.lessonInfo()?.tasks ?? []);

  protected readonly currentTask = computed(() => {
    const id = this.currentTaskId();
    return this.tasks().find(t => t.id === id) ?? null;
  });

  protected readonly isLastTask = computed(() => {
    const allTasksLength = this.tasks().length;
    return allTasksLength === this.currentTask()?.order;
  });

  protected readonly isSubmitDisabled = computed(() => {
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

  ngOnInit() {
    this.route.data
      .pipe(
        map(data => data["data"] as CourseLesson),
        tap(() => {
          this.loading.set(true);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: lessonInfo => {
          this.lessonInfo.set(lessonInfo);

          // Если курс уже завершен, редирект на results
          if (lessonInfo.progressStatus === "completed") {
            setTimeout(() => {
              this.loading.set(false);
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
            // Находимся на results, но не все задания выполнены — редирект обратно
            this.currentTaskId.set(nextTaskId);
            setTimeout(() => {
              this.loading.set(false);
              this.router.navigate(["./"], { relativeTo: this.route });
            }, 500);
          } else if (nextTaskId === null && allCompleted) {
            // Все задания выполнены, редирект на results
            setTimeout(() => {
              this.loading.set(false);
              this.router.navigate(["results"], { relativeTo: this.route });
            }, 500);
          } else {
            this.currentTaskId.set(nextTaskId);
            setTimeout(() => this.loading.set(false), 500);
          }
        },
        complete: () => {
          setTimeout(() => this.loading.set(false), 500);
        },
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

  isCurrent(taskId: number): boolean {
    return this.currentTaskId() === taskId;
  }

  isDone(task: Task): boolean {
    return task.isCompleted || this.completedTaskIds().has(task.id);
  }

  onSubmitAnswer() {
    const task = this.currentTask();
    if (!task) return;

    this.loader.set(true);

    const body = this.answerBody();
    const isTextFile = task.answerType === "text_and_files";
    const answerText = task.answerType === "text" || isTextFile ? body?.text : undefined;
    const optionIds =
      task.answerType === "single_choice" || task.answerType === "multiple_choice"
        ? body
        : undefined;
    const fileIds = task.answerType === "files" ? body : isTextFile ? body?.fileUrls : undefined;

    this.coursesAdapter
      .postAnswerQuestion(task.id, answerText, optionIds, fileIds)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.loader.set(false);

          if (res.isCorrect) {
            this.success.set(true);
            this.hasError.set(false);
            this.completedTaskIds.update(ids => new Set([...ids, task.id]));
            this.snackbarService.success("правильный ответ, продолжайте дальше");
          } else {
            this.hasError.set(true);
            this.success.set(false);
            this.snackbarService.error("неверный ответ, попробуйте еще раз!");
            setTimeout(() => this.hasError.set(false), 1000);
            return;
          }

          if (!res.canContinue) return;

          setTimeout(() => {
            const nextId = res.nextTaskId ?? this.getNextTask()?.id ?? null;

            if (nextId) {
              this.currentTaskId.set(nextId);
              this.success.set(false);
              this.answerBody.set(null);
            } else {
              this.router.navigate(["results"], { relativeTo: this.route });
            }
          }, 1000);
        },
        error: () => {
          this.loader.set(false);
          this.hasError.set(true);
          this.snackbarService.error("неверный ответ, попробуйте еще раз!");
        },
      });
  }

  private getNextTask(): Task | null {
    const currentId = this.currentTaskId();
    const allTasks = this.tasks();
    const currentIndex = allTasks.findIndex(t => t.id === currentId);
    const next = allTasks.slice(currentIndex + 1).find(t => t.isAvailable && !t.isCompleted);
    return next ?? null;
  }

  onAnswerChange(value: any) {
    this.answerBody.set(value);
  }
}
