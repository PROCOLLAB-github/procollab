/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProfileNewsRepositoryPort } from "@domain/profile/ports/profile-news.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class DeleteProfileNewsUseCase {
  private readonly profileNewsRepositoryPort = inject(ProfileNewsRepositoryPort);

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
