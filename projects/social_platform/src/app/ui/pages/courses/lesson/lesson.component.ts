/** @format */

import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { Task } from "@domain/courses/courses.model";
import { ButtonComponent } from "@ui/primitives";
import { InfoTaskComponent } from "./shared/video-task/info-task.component";
import { WriteTaskComponent } from "./shared/write-task/write-task.component";
import { ExcludeTaskComponent } from "./shared/exclude-task/exclude-task.component";
import { RadioSelectTaskComponent } from "./shared/radio-select-task/radio-select-task.component";
import { FileTaskComponent } from "./shared/file-task/file-task.component";
import { LoaderComponent } from "@ui/primitives/loader/loader.component";
import { LessonInfoService } from "@api/courses/facades/lesson-info.service";
import { LessonUIInfoService } from "@api/courses/facades/ui/lesson-ui-info.service";

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
  providers: [LessonInfoService, LessonUIInfoService],
})
export class LessonComponent implements OnInit, OnDestroy {
  private readonly lessonInfoService = inject(LessonInfoService);
  private readonly lessonUIInfoService = inject(LessonUIInfoService);

  protected readonly lessonInfo = this.lessonUIInfoService.lessonInfo;
  protected readonly isComplete = this.lessonUIInfoService.isComplete;
  protected readonly currentTask = this.lessonUIInfoService.currentTask;
  protected readonly tasks = this.lessonUIInfoService.tasks;
  protected readonly isLastTask = this.lessonUIInfoService.isLastTask;
  protected readonly isSubmitDisabled = this.lessonUIInfoService.isSubmitDisabled;
  protected readonly loader = this.lessonUIInfoService.loader;
  protected readonly loading = this.lessonUIInfoService.loading;
  protected readonly success = this.lessonUIInfoService.success;
  protected readonly hasError = this.lessonUIInfoService.hasError;

  ngOnInit(): void {
    this.lessonInfoService.init();
  }

  ngOnDestroy(): void {
    this.lessonInfoService.destroy();
  }

  isCurrent(taskId: number): boolean {
    return this.lessonUIInfoService.currentTaskId() === taskId;
  }

  isDone(task: Task): boolean {
    return this.lessonUIInfoService.isDone(task);
  }

  onAnswerChange(value: any): void {
    this.lessonInfoService.onAnswerChange(value);
  }

  onSubmitAnswer(): void {
    this.lessonInfoService.onSubmitAnswer();
  }
}
