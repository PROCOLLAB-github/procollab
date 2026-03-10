/** @format */

import { inject, Injectable } from "@angular/core";
import { plainToInstance } from "class-transformer";
import { forkJoin, map, Observable } from "rxjs";
import { ApiPagination } from "../../../domain/other/api-pagination.model";
import { FeedNews } from "../../../domain/project/project-news.model";
import { ProgramNewsHttpAdapter } from "../../adapters/program/program-news-http.adapter";
import { ProgramNewsRepositoryPort } from "../../../domain/program/ports/program-news.repository.port";

@Injectable({ providedIn: "root" })
export class ProgramNewsRepository implements ProgramNewsRepositoryPort {
  private readonly programNewsAdapter = inject(ProgramNewsHttpAdapter);

  fetchNews(limit: number, offset: number, programId: number): Observable<ApiPagination<FeedNews>> {
    return this.programNewsAdapter
      .fetchNews(limit, offset, programId)
      .pipe(map(page => ({ ...page, results: plainToInstance(FeedNews, page.results) })));
  }

  readNews(programId: string, newsIds: number[]): Observable<void[]> {
    return forkJoin(newsIds.map(id => this.programNewsAdapter.setNewsViewed(programId, id)));
  }

  toggleLike(programId: string, newsId: number, state: boolean): Observable<void> {
    return this.programNewsAdapter.toggleLike(programId, newsId, state);
  }

  addNews(programId: number, obj: { text: string; files: string[] }): Observable<FeedNews> {
    return this.programNewsAdapter
      .addNews(programId, obj)
      .pipe(map(news => plainToInstance(FeedNews, news)));
  }

  editNews(programId: number, newsId: number, newsItem: Partial<FeedNews>): Observable<FeedNews> {
    return this.programNewsAdapter
      .editNews(programId, newsId, newsItem)
      .pipe(map(news => plainToInstance(FeedNews, news)));
  }

  deleteNews(programId: number, newsId: number): Observable<void> {
    return this.programNewsAdapter.deleteNews(programId, newsId);
  }
}
