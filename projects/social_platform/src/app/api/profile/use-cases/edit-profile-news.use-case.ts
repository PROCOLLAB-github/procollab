/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProfileNews } from "@domain/profile/profile-news.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { PROFILE_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";

/** Сценарий: отредактировать новость профиля; ошибка → `edit_profile_news_error`. */
@Injectable({ providedIn: "root" })
export class EditProfileNewsUseCase {
  private readonly profileNewsRepositoryPort = inject(PROFILE_NEWS_REPOSITORY);

  execute(
    userId: string,
    newsId: number,
    news: Partial<ProfileNews>
  ): Observable<Result<ProfileNews, { kind: "edit_profile_news_error"; cause?: unknown }>> {
    return this.profileNewsRepositoryPort.editNews(userId, newsId, news).pipe(
      map(result => ok<ProfileNews>(result)),
      catchError(error => of(fail({ kind: "edit_profile_news_error" as const, cause: error })))
    );
  }
}
