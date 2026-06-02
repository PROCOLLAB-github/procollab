/** @format */

import { InjectionToken } from "@angular/core";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { Observable } from "rxjs";
import { FeedNews } from "@domain/news/project-news.model";
import { ProfileNews } from "@domain/profile/profile-news.model";

/** Дженерик-порт новостей (project/profile/program): fetch/detail/add/edit/delete + read/like. DI — через три раздельных InjectionToken (см. ниже). */
export abstract class NewsRepositoryPort<T> {
  abstract fetchNews(id: string, limit?: number, offset?: number): Observable<ApiPagination<T>>;

  abstract fetchNewsDetail(id: string, newsId: string): Observable<T>;

  abstract addNews(id: string, obj: { text: string; files: string[] }): Observable<T>;

  abstract readNews(id: number, newsIds: number[]): Observable<void[]>;

  abstract delete(id: string, newsId: number): Observable<void>;

  abstract toggleLike(id: string, newsId: number, state: boolean): Observable<void>;

  abstract editNews(id: string, newsId: number, newsItem: Partial<T>): Observable<T>;
}

/**
 * Раздельные DI-токены: дженерик стирается в рантайме, поэтому один общий
 * `NewsRepositoryPort` как токен вызвал бы коллизию (последний провайдер
 * побеждает). Каждый домен инжектит свой токен.
 */
export const PROJECT_NEWS_REPOSITORY = new InjectionToken<NewsRepositoryPort<FeedNews>>(
  "PROJECT_NEWS_REPOSITORY",
);

export const PROFILE_NEWS_REPOSITORY = new InjectionToken<NewsRepositoryPort<ProfileNews>>(
  "PROFILE_NEWS_REPOSITORY",
);

export const PROGRAM_NEWS_REPOSITORY = new InjectionToken<NewsRepositoryPort<FeedNews>>(
  "PROGRAM_NEWS_REPOSITORY",
);
