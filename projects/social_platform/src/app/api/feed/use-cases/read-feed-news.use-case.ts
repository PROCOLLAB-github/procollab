/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProfileNewsRepositoryPort } from "@domain/profile/ports/profile-news.repository.port";
import { ProjectNewsRepositoryPort } from "@domain/project/ports/project-news.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class ReadFeedNewsUseCase {
  private readonly projectNewsRepositoryPort = inject(ProjectNewsRepositoryPort);
  private readonly profileNewsRepositoryPort = inject(ProfileNewsRepositoryPort);

  execute(
    ownerType: "project" | "profile",
    ownerId: number,
    newsIds: number[]
  ): Observable<Result<void[], { kind: "read_feed_news_error"; cause?: unknown }>> {
    const request$ =
      ownerType === "profile"
        ? this.profileNewsRepositoryPort.readNews(ownerId, newsIds)
        : this.projectNewsRepositoryPort.readNews(ownerId, newsIds);

    return request$.pipe(
      map(result => ok<void[]>(result)),
      catchError(error => of(fail({ kind: "read_feed_news_error" as const, cause: error })))
    );
  }
}
