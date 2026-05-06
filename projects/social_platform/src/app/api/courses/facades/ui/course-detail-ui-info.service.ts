/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { CourseDetail, CourseLesson, CourseStructure } from "@domain/courses/courses.model";
import { AsyncState, initial, isLoading, isSuccess } from "@domain/shared/async-state";
import { SeenModulesStoragePort } from "@domain/courses/ports/seen-modules-storage.port";

@Injectable()
export class CourseDetailUIInfoService {
  private readonly seenModulesStorage = inject(SeenModulesStoragePort);

  readonly courseDetail$ = signal<AsyncState<CourseDetail>>(initial());
  readonly courseStructure$ = signal<AsyncState<CourseStructure>>(initial());

  readonly currentLesson = signal<CourseLesson | undefined>(undefined);

  readonly currentLessonOrder = computed<number | null>(() => {
    const lesson = this.currentLesson();
    const structure = this.courseStructure();
    if (!lesson || !structure) return null;

    for (const mod of structure.modules) {
      const found = mod.lessons.find(l => l.id === lesson.id);
      if (found) return found.order;
    }
    return null;
  });

  readonly loading = computed(() => {
    const detail = this.courseDetail$();
    const structure = this.courseStructure$();
    return (
      detail.status === "initial" ||
      isLoading(detail) ||
      structure.status === "initial" ||
      isLoading(structure)
    );
  });

  readonly course = computed(() => {
    const state = this.courseDetail$();
    return isSuccess(state) ? state.data : undefined;
  });

  readonly courseStructure = computed(() => {
    const state = this.courseStructure$();
    return isSuccess(state) ? state.data : undefined;
  });

  readonly courseModules = computed(() => this.courseStructure()?.modules ?? []);

  readonly isDisabled = computed(() => {
    const course = this.course();
    return course ? !course.partnerProgramId : false;
  });

  readonly isTaskDetail = signal<boolean>(false);
  readonly isCompleteModule = signal<boolean>(false);
  readonly isCourseCompleted = signal<boolean>(false);

  applyCourseData(structure: CourseStructure): void {
    this.checkCompletedModules(structure);
  }

  private checkCompletedModules(structure: CourseStructure): void {
    const unseenModule = structure.modules
      .filter(m => m.progressStatus === "completed")
      .find(m => !this.seenModulesStorage.isSeen(structure.courseId, m.id));

    if (unseenModule) {
      const allModulesCompleted = structure.modules.every(m => m.progressStatus === "completed");
      this.isCourseCompleted.set(allModulesCompleted);
      this.isCompleteModule.set(true);
      this.seenModulesStorage.markSeen(structure.courseId, unseenModule.id);
    }
  }
}
