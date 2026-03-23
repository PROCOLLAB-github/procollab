/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProfileNewsRepositoryPort } from "../../../domain/profile/ports/profile-news.repository.port";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class ReadProfileNewsUseCase {
  private readonly profileNewsRepositoryPort = inject(ProfileNewsRepositoryPort);

  execute(
    userId: number,
    newsIds: number[]
  ): Observable<Result<void[], { kind: "read_profile_news_error"; cause?: unknown }>> {
    return this.profileNewsRepositoryPort.readNews(userId, newsIds).pipe(
      map(result => ok<void[]>(result)),
      catchError(error => of(fail({ kind: "read_profile_news_error" as const, cause: error })))
    );
  }
}
