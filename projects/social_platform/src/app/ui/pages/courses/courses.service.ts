/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import {
  CourseCard,
  CourseDetail,
  CourseLesson,
  CourseStructure,
  TaskAnswerResponse,
} from "@domain/project/courses.model";
import { Observable } from "rxjs";

/**
 * Сервис Курсов
 *
 * Управляет всеми операциями, связанными с курсами, включая:
 * - Отслеживание прогресса пользователя по курсу
 */
@Injectable({
  providedIn: "root",
})
export class CoursesService {
  private readonly COURSE_URL = "/courses";

  constructor(private readonly apiService: ApiService) {}

  /**
   * Получает доступные курсов
   *
   * @returns Observable<CourseCard[]> - Список доступных курсов
   */
  getCourses(): Observable<CourseCard[]> {
    return this.apiService.get<CourseCard[]>(`${this.COURSE_URL}/`);
  }

  /**
   * Получает подробную информацию о конкретном курсе
   *
   * @param id - Уникальный идентификатор курса
   * @returns Observable<CourseDetail> - Полная информация о курсе
   */
  getCourseDetail(id: number): Observable<CourseDetail> {
    return this.apiService.get<CourseDetail>(`${this.COURSE_URL}/${id}/`);
  }

  /**
   * Получает подробную информацию о структуре курса
   *
   * @param id - Уникальный идентификатор курса
   * @returns Observable<CourseStructure> - Полную структуру курса
   */
  getCourseStructure(id: number): Observable<CourseStructure> {
    return this.apiService.get<CourseStructure>(`${this.COURSE_URL}/${id}/structure/`);
  }

  /**
   * Получает полную информацию по отдельному уроку внутри курса
   *
   * @param id - Уникальный идентификатор урока
   * @returns Observable<CourseLesson> - Полная информация для урока конкретного
   */
  getCourseLesson(id: number): Observable<CourseLesson> {
    return this.apiService.get<CourseLesson>(`${this.COURSE_URL}/lessons/${id}/`);
  }

  /**
   *
   * @param id - Уникальный идентификатор задачи
   * @param answerText - Текст ответа
   * @param optionIds - id ответов выбранных
   * @param fileIds - id файлов загруженных
   * @returns Observable<TaskAnswerResponse> - Информация от прохождении урока
   */
  postAnswerQuestion(
    id: number,
    answerText?: any,
    optionIds?: number[],
    fileIds?: number[]
  ): Observable<TaskAnswerResponse> {
    return this.apiService.post<TaskAnswerResponse>(`${this.COURSE_URL}/tasks/${id}/answer/`, {
      answerText,
      optionIds,
      fileIds,
    });
  }
}
