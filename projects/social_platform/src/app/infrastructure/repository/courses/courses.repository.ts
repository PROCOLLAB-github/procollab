/** @format */

import { inject, Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import {
  CourseCard,
  CourseDetail,
  CourseLesson,
  CourseStructure,
  TaskAnswerResponse,
} from "@domain/courses/courses.model";
import { CoursesRepositoryPort } from "@domain/courses/ports/courses.repository.port";
import { CoursesHttpAdapter } from "../../adapters/courses/courses-http.adapter";
import { EntityCache } from "@domain/shared/entity-cache";
import { EventBus } from "@domain/shared/event-bus";
import { taskAnswerSubmitted } from "@domain/courses/events/task-answer-submitted.event";

@Injectable({ providedIn: "root" })
export class CoursesRepository implements CoursesRepositoryPort {
  private readonly coursesAdapter = inject(CoursesHttpAdapter);
  private readonly eventBus = inject(EventBus);
  private readonly detailCache = new EntityCache<CourseDetail>();
  private readonly structureCache = new EntityCache<CourseStructure>();

  getCourses(): Observable<CourseCard[]> {
    return this.coursesAdapter.getCourses();
  }

  getCourseDetail(courseId: number): Observable<CourseDetail> {
    return this.detailCache.getOrFetch(courseId, () =>
      this.coursesAdapter.getCourseDetail(courseId)
    );
  }

  getCourseStructure(courseId: number): Observable<CourseStructure> {
    return this.structureCache.getOrFetch(courseId, () =>
      this.coursesAdapter.getCourseStructure(courseId)
    );
  }

  getCourseLesson(lessonId: number): Observable<CourseLesson> {
    return this.coursesAdapter.getCourseLesson(lessonId);
  }

  postAnswerQuestion(
    taskId: number,
    answerText?: any,
    optionIds?: number[],
    fileIds?: number[]
  ): Observable<TaskAnswerResponse> {
    return this.coursesAdapter.postAnswerQuestion(taskId, answerText, optionIds, fileIds).pipe(
      tap(response => {
        this.eventBus.emit(taskAnswerSubmitted(taskId, 0, response));
        // Инвалидируем кеш структуры, т.к. прогресс изменился
        this.structureCache.clear();
      })
    );
  }
}
