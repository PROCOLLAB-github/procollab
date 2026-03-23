/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import {
  CourseCard,
  CourseDetail,
  CourseLesson,
  CourseStructure,
  TaskAnswerResponse,
} from "@domain/courses/courses.model";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class CoursesHttpAdapter {
  private readonly COURSE_URL = "/courses";
  private readonly apiService = inject(ApiService);

  getCourses(): Observable<CourseCard[]> {
    return this.apiService.get<CourseCard[]>(`${this.COURSE_URL}/`);
  }

  getCourseDetail(id: number): Observable<CourseDetail> {
    return this.apiService.get<CourseDetail>(`${this.COURSE_URL}/${id}/`);
  }

  getCourseStructure(id: number): Observable<CourseStructure> {
    return this.apiService.get<CourseStructure>(`${this.COURSE_URL}/${id}/structure/`);
  }

  getCourseLesson(id: number): Observable<CourseLesson> {
    return this.apiService.get<CourseLesson>(`${this.COURSE_URL}/lessons/${id}/`);
  }

  postAnswerQuestion(
    taskId: number,
    answerText?: any,
    optionIds?: number[],
    fileIds?: number[]
  ): Observable<TaskAnswerResponse> {
    return this.apiService.post<TaskAnswerResponse>(`${this.COURSE_URL}/tasks/${taskId}/answer/`, {
      answerText,
      optionIds,
      fileIds,
    });
  }
}
