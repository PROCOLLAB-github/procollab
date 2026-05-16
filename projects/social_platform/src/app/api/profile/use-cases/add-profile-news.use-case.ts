/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProfileNews } from "@domain/profile/profile-news.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { PROFILE_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";

@Injectable({ providedIn: "root" })
export class AddProfileNewsUseCase {
  private readonly profileNewsRepositoryPort = inject(PROFILE_NEWS_REPOSITORY);

  execute(
    userId: string,
    news: { text: string; files: string[] }
  ): Observable<Result<ProfileNews, { kind: "add_profile_news_error"; cause?: unknown }>> {
    return this.profileNewsRepositoryPort.addNews(userId, news).pipe(
      map(result => ok<ProfileNews>(result)),
      catchError(error => of(fail({ kind: "add_profile_news_error" as const, cause: error })))
    );
  }
}
