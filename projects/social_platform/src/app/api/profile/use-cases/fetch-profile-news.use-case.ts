/** @format */

import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { ApiPagination } from "../../../domain/other/api-pagination.model";
import { ProfileNews } from "../../../domain/profile/profile-news.model";
import { ProfileNewsRepositoryPort } from "../../../domain/profile/ports/profile-news.repository.port";
import { fail, ok, Result } from "../../../domain/shared/result.type";

@Injectable({ providedIn: "root" })
export class FetchProfileNewsUseCase {
  private readonly profileNewsRepositoryPort = inject(ProfileNewsRepositoryPort);

  execute(
    userId: number
  ): Observable<
    Result<ApiPagination<ProfileNews>, { kind: "fetch_profile_news_error"; cause?: unknown }>
  > {
    return this.profileNewsRepositoryPort.fetchNews(userId).pipe(
      map(news => ok<ApiPagination<ProfileNews>>(news)),
      catchError(error => of(fail({ kind: "fetch_profile_news_error" as const, cause: error })))
    );
  }
}
