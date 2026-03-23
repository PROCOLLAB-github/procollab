/** @format */

import { computed, Injectable, signal } from "@angular/core";
import { CourseDetail, CourseStructure } from "@domain/courses/courses.model";
import { AsyncState, initial, isLoading, isSuccess } from "@domain/shared/async-state";

@Injectable()
export class CourseDetailUIInfoService {
  readonly courseDetail$ = signal<AsyncState<CourseDetail>>(initial());
  readonly courseStructure$ = signal<AsyncState<CourseStructure>>(initial());

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
    const completedModuleIds = structure.modules
      .filter(m => m.progressStatus === "completed")
      .map(m => m.id);

    const unseenModule = completedModuleIds.find(
      id => !localStorage.getItem(`course_${structure.courseId}_module_${id}_complete_seen`)
    );

    if (unseenModule) {
      const allModulesCompleted = structure.modules.every(m => m.progressStatus === "completed");
      this.isCourseCompleted.set(allModulesCompleted);
      this.isCompleteModule.set(true);
      localStorage.setItem(
        `course_${structure.courseId}_module_${unseenModule}_complete_seen`,
        "true"
      );
    }
  }
}
