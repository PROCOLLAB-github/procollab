/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { ProfileNews } from "@domain/profile/profile-news.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { PROFILE_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";

/** Сценарий: страница новостей профиля; ошибка → `fetch_profile_news_error`. */
@Injectable({ providedIn: "root" })
export class FetchProfileNewsUseCase {
  private readonly profileNewsRepositoryPort = inject(PROFILE_NEWS_REPOSITORY);

  execute(
    userId: number,
  ): Observable<
    Result<ApiPagination<ProfileNews>, { kind: "fetch_profile_news_error"; cause?: unknown }>
  > {
    return this.profileNewsRepositoryPort.fetchNews(String(userId)).pipe(
      map(news => ok<ApiPagination<ProfileNews>>(news)),
      catchError(error => of(fail({ kind: "fetch_profile_news_error" as const, cause: error }))),
    );
  }
}
