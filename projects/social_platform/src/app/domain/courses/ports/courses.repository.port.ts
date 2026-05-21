/** @format */

import { Observable } from "rxjs";
import {
  CourseCard,
  CourseDetail,
  CourseLesson,
  CourseStructure,
  TaskAnswerResponse,
} from "../courses.model";

/** Порт репозитория курсов: курсы, детали, структура, урок, отправка ответа на задачу. */
export abstract class CoursesRepositoryPort {
  abstract getCourses(): Observable<CourseCard[]>;

  abstract getCourseDetail(courseId: number): Observable<CourseDetail>;

  abstract getCourseStructure(courseId: number): Observable<CourseStructure>;

  abstract getCourseLesson(lessonId: number): Observable<CourseLesson>;

  abstract postAnswerQuestion(
    taskId: number,
    answerText?: string,
    optionIds?: number[],
    fileIds?: number[]
  ): Observable<TaskAnswerResponse>;
}
