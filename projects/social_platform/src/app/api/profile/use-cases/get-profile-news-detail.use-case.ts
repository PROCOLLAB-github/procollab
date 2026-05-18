/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProfileNews } from "@domain/profile/profile-news.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { PROFILE_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";

@Injectable({ providedIn: "root" })
export class GetProfileNewsDetailUseCase {
  private readonly profileNewsRepositoryPort = inject(PROFILE_NEWS_REPOSITORY);

  execute(
    userId: string,
    newsId: string
  ): Observable<Result<ProfileNews, { kind: "get_profile_news_detail_error"; cause?: unknown }>> {
    return this.profileNewsRepositoryPort.fetchNewsDetail(userId, newsId).pipe(
      map(news => ok<ProfileNews>(news)),
      catchError(error =>
        of(fail({ kind: "get_profile_news_detail_error" as const, cause: error }))
      )
    );
  }
}
