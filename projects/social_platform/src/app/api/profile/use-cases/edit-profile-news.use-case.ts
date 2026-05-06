/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProfileNews } from "@domain/profile/profile-news.model";
import { ProfileNewsRepositoryPort } from "@domain/profile/ports/profile-news.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class EditProfileNewsUseCase {
  private readonly profileNewsRepositoryPort = inject(ProfileNewsRepositoryPort);

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
