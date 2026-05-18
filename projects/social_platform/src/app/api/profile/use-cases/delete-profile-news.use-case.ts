/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { fail, ok, Result } from "@domain/shared/result.type";
import { PROFILE_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";

@Injectable({ providedIn: "root" })
export class DeleteProfileNewsUseCase {
  private readonly profileNewsRepositoryPort = inject(PROFILE_NEWS_REPOSITORY);

  execute(
    userId: string,
    newsId: number
  ): Observable<Result<void, { kind: "delete_profile_news_error"; cause?: unknown }>> {
    return this.profileNewsRepositoryPort.delete(userId, newsId).pipe(
      map(() => ok<void>(undefined)),
      catchError(error => of(fail({ kind: "delete_profile_news_error" as const, cause: error })))
    );
  }
}
