/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { forkJoin, map, Observable } from "rxjs";
import { ApiPagination } from "@models/api-pagination.model";
import { FeedNews } from "@office/projects/models/project-news.model";
import { HttpParams } from "@angular/common/http";
import { plainToInstance } from "class-transformer";

/**
 * Сервис для работы с новостями программ
 *
 * Обеспечивает функциональность новостной ленты программы:
 * - Загрузка новостей с пагинацией
 * - Отметка новостей как прочитанных
 * - Лайки/дизлайки новостей
 * - Добавление новых новостей
 *
 * Принимает:
 * @param {ApiService} apiService - Сервис для HTTP запросов
 *
 * Методы:
 * @method fetchNews(limit: number, offset: number, programId: number) - Загружает новости программы
 * @method readNews(projectId: string, newsIds: number[]) - Отмечает новости как прочитанные
 * @method toggleLike(projectId: string, newsId: number, state: boolean) - Переключает лайк новости
 * @method addNews(programId: number, obj: {text: string; files: string[]}) - Добавляет новую новость
 *
 * @returns Соответствующие Observable для каждого метода
 */
@Injectable({
  providedIn: "root",
})
export class ProgramNewsService {
  private readonly PROGRAMS_URL = "/programs";

  constructor(private readonly apiService: ApiService) {}

  fetchNews(limit: number, offset: number, programId: number): Observable<ApiPagination<FeedNews>> {
    return this.apiService.get(
      `${this.PROGRAMS_URL}/${programId}/news/`,
      new HttpParams({ fromObject: { limit, offset } })
    );
  }

  readNews(projectId: string, newsIds: number[]): Observable<void[]> {
    return forkJoin(
      newsIds.map(id =>
        this.apiService.post<void>(`${this.PROGRAMS_URL}/${projectId}/news/${id}/set_viewed/`, {})
      )
    );
  }

  toggleLike(projectId: string, newsId: number, state: boolean): Observable<void> {
    return this.apiService.post(`${this.PROGRAMS_URL}/${projectId}/news/${newsId}/set_liked/`, {
      is_liked: state,
    });
  }

  addNews(programId: number, obj: { text: string; files: string[] }) {
    return this.apiService
      .post(`${this.PROGRAMS_URL}/${programId}/news/`, obj)
      .pipe(map(r => plainToInstance(FeedNews, r)));
  }
}
