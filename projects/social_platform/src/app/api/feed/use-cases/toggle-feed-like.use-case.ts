/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ProfileNewsRepositoryPort } from "@domain/profile/ports/profile-news.repository.port";
import { ProjectNewsRepositoryPort } from "@domain/project/ports/project-news.repository.port";
import { fail, ok, Result } from "@domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class ToggleFeedLikeUseCase {
  private readonly projectNewsRepositoryPort = inject(ProjectNewsRepositoryPort);
  private readonly profileNewsRepositoryPort = inject(ProfileNewsRepositoryPort);

  execute(
    ownerType: "project" | "profile",
    ownerId: string,
    newsId: number,
    state: boolean
  ): Observable<Result<void, { kind: "toggle_feed_like_error"; cause?: unknown }>> {
    const request$ =
      ownerType === "profile"
        ? this.profileNewsRepositoryPort.toggleLike(ownerId, newsId, state)
        : this.projectNewsRepositoryPort.toggleLike(ownerId, newsId, state);

    return request$.pipe(
      map(() => ok<void>(undefined)),
      catchError(error => of(fail({ kind: "toggle_feed_like_error" as const, cause: error })))
    );
  }
}
