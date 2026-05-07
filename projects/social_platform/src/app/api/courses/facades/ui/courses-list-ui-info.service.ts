/** @format */

import { computed, Injectable, signal } from "@angular/core";
import { CourseCard } from "@domain/courses/courses.model";
import { AsyncState, initial, isLoading, isSuccess } from "@domain/shared/async-state";

@Injectable()
export class CoursesListUIInfoService {
  readonly courses$ = signal<AsyncState<CourseCard[]>>(initial());

  readonly loading = computed(() => {
    const state = this.courses$();
    return state.status === "initial" || isLoading(state);
  });

  readonly coursesList = computed(() => {
    const state = this.courses$();
    return isSuccess(state) ? state.data : [];
  });
}
