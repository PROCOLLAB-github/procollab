/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { forkJoin, map, Observable, tap } from "rxjs";
import { plainToInstance } from "class-transformer";
import { HttpParams } from "@angular/common/http";
import { StorageService } from "projects/social_platform/src/app/api/storage/storage.service";
import { ApiPagination } from "projects/social_platform/src/app/domain/other/api-pagination.model";
import { FeedNews } from "../../domain/project/project-news.model";

/**
 * СЕРВИС ДЛЯ РАБОТЫ С НОВОСТЯМИ ПРОЕКТА
 *
 * Этот сервис предоставляет методы для работы с новостями проекта:
 * - Загрузка списка новостей
 * - Получение детальной информации о новости
 * - Добавление новых новостей
 * - Редактирование существующих новостей
 * - Удаление новостей
 * - Отметка новостей как просмотренных
 * - Управление лайками новостей
 *
 * @params
 * - projectId: string - ID проекта
 * - newsId: string/number - ID новости
 * - obj: объект с данными новости (текст, файлы)
 * - state: boolean - состояние лайка
 *
 * @returns
 * - Observable с результатами API-запросов
 * - Трансформированные объекты новостей через class-transformer
 *
 * ОСОБЕННОСТИ:
 * - Использует локальное хранение для отслеживания просмотренных новостей
 * - Поддерживает пагинацию (лимит 100 новостей)
 * - Автоматически трансформирует ответы API в типизированные объекты
 */
@Injectable({
  providedIn: "root",
})
export class ProjectNewsService {
  private readonly PROJECTS_URL = "/projects";

  storageService = inject(StorageService); // Сервис для работы с локальным хранилищем
  apiService = inject(ApiService); // Сервис для API-запросов

  /**
   * Загрузка списка новостей проекта
   * @param projectId - ID проекта
   * @returns Observable с пагинированным списком новостей
   */
  fetchNews(projectId: string): Observable<ApiPagination<FeedNews>> {
    return this.apiService.get<ApiPagination<FeedNews>>(
      `${this.PROJECTS_URL}/${projectId}/news/`,
      new HttpParams({ fromObject: { limit: 100 } }) // Загружаем до 100 новостей
    );
  }

  /**
   * Получение детальной информации о конкретной новости
   * @param projectId - ID проекта
   * @param newsId - ID новости
   * @returns Observable с объектом новости
   */
  fetchNewsDetail(projectId: string, newsId: string): Observable<FeedNews> {
    return this.apiService
      .get<FeedNews>(`${this.PROJECTS_URL}/${projectId}/news/${newsId}`)
      .pipe(map(r => plainToInstance(FeedNews, r))); // Трансформируем ответ в типизированный объект
  }

  /**
   * Добавление новой новости в проект
   * @param projectId - ID проекта
   * @param obj - объект с текстом и файлами новости
   * @returns Observable с созданной новостью
   */
  addNews(projectId: string, obj: { text: string; files: string[] }): Observable<FeedNews> {
    return this.apiService
      .post(`${this.PROJECTS_URL}/${projectId}/news/`, obj)
      .pipe(map(r => plainToInstance(FeedNews, r)));
  }

  /**
   * Отметка новостей как просмотренных
   * Использует локальное хранилище для отслеживания уже просмотренных новостей
   * @param projectId - ID проекта
   * @param newsIds - массив ID новостей для отметки
   * @returns Observable с массивом результатов запросов
   */
  readNews(projectId: number, newsIds: number[]): Observable<void[]> {
    // Получаем список уже просмотренных новостей из сессионного хранилища
    const readNews = this.storageService.getItem<number[]>("readNews", sessionStorage) ?? [];

    return forkJoin(
      newsIds
        .filter(id => !readNews.includes(id)) // Фильтруем уже просмотренные
        .map(id =>
          this.apiService
            .post<void>(`${this.PROJECTS_URL}/${projectId}/news/${id}/set_viewed/`, {})
            .pipe(
              tap(() => {
                // Сохраняем ID просмотренной новости в локальное хранилище
                this.storageService.setItem("readNews", [...readNews, id], sessionStorage);
              })
            )
        )
    );
  }

  /**
   * Удаление новости
   * @param projectId - ID проекта
   * @param newsId - ID удаляемой новости
   * @returns Observable с результатом удаления
   */
  delete(projectId: string, newsId: number): Observable<void> {
    return this.apiService.delete(`${this.PROJECTS_URL}/${projectId}/news/${newsId}/`);
  }

  /**
   * Переключение лайка новости
   * @param projectId - ID проекта
   * @param newsId - ID новости
   * @param state - новое состояние лайка (true/false)
   * @returns Observable с результатом операции
   */
  toggleLike(projectId: string, newsId: number, state: boolean): Observable<void> {
    return this.apiService.post(`${this.PROJECTS_URL}/${projectId}/news/${newsId}/set_liked/`, {
      is_liked: state,
    });
  }

  /**
   * Редактирование существующей новости
   * @param projectId - ID проекта
   * @param newsId - ID редактируемой новости
   * @param newsItem - частичные данные для обновления
   * @returns Observable с обновленной новостью
   */
  editNews(projectId: string, newsId: number, newsItem: Partial<FeedNews>): Observable<FeedNews> {
    return this.apiService
      .patch(`${this.PROJECTS_URL}/${projectId}/news/${newsId}/`, newsItem)
      .pipe(map(r => plainToInstance(FeedNews, r)));
  }
}
