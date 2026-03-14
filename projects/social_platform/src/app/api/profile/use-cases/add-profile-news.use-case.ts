/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProfileNews } from "../../../domain/profile/profile-news.model";
import { ProfileNewsRepositoryPort } from "../../../domain/profile/ports/profile-news.repository.port";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class AddProfileNewsUseCase {
  private readonly profileNewsRepositoryPort = inject(ProfileNewsRepositoryPort);

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
