/** @format */

import { inject, Injectable } from "@angular/core";
import { fail, ok, Result } from "@domain/shared/result.type";
import { catchError, map, Observable, of } from "rxjs";
import { FeedNews } from "@domain/news/project-news.model";
import { PROGRAM_NEWS_REPOSITORY } from "@domain/news/port/news.repository.port";

/** Сценарий: отредактировать новость программы; ошибка → `unknown`. */
@Injectable({ providedIn: "root" })
export class EditNewsUseCase {
  private readonly programNewsRepositoryPort = inject(PROGRAM_NEWS_REPOSITORY);

  execute(
    programId: number,
    newsId: number,
    newsItem: Partial<FeedNews>,
  ): Observable<Result<FeedNews, { kind: "unknown" }>> {
    return this.programNewsRepositoryPort.editNews(String(programId), newsId, newsItem).pipe(
      map(news => ok<FeedNews>(news)),
      catchError(() => of(fail({ kind: "unknown" as const }))),
    );
  }
}
