/** @format */

import { inject, Injectable } from "@angular/core";
import { plainToInstance } from "class-transformer";
import { EMPTY, forkJoin, map, Observable } from "rxjs";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { FeedNews } from "@domain/news/project-news.model";
import { ProgramNewsHttpAdapter } from "../../adapters/program/program-news-http.adapter";
import { NewsRepositoryPort } from "@domain/news/port/news.repository.port";

@Injectable({ providedIn: "root" })
export class ProgramNewsRepository implements NewsRepositoryPort<FeedNews> {
  private readonly programNewsAdapter = inject(ProgramNewsHttpAdapter);

  fetchNews(programId: string, limit: number, offset: number): Observable<ApiPagination<FeedNews>> {
    return this.programNewsAdapter
      .fetchNews(Number(programId), limit, offset)
      .pipe(map(page => ({ ...page, results: plainToInstance(FeedNews, page.results) })));
  }

  readNews(programId: number, newsIds: number[]): Observable<void[]> {
    return forkJoin(
      newsIds.map(id => this.programNewsAdapter.setNewsViewed(String(programId), id))
    );
  }

  toggleLike(programId: string, newsId: number, state: boolean): Observable<void> {
    return this.programNewsAdapter.toggleLike(programId, newsId, state);
  }

  addNews(programId: string, obj: { text: string; files: string[] }): Observable<FeedNews> {
    return this.programNewsAdapter
      .addNews(Number(programId), obj)
      .pipe(map(news => plainToInstance(FeedNews, news)));
  }

  editNews(programId: string, newsId: number, newsItem: Partial<FeedNews>): Observable<FeedNews> {
    return this.programNewsAdapter
      .editNews(Number(programId), newsId, newsItem)
      .pipe(map(news => plainToInstance(FeedNews, news)));
  }

  delete(programId: string, newsId: number): Observable<void> {
    return this.programNewsAdapter.deleteNews(Number(programId), newsId);
  }

  fetchNewsDetail(): Observable<FeedNews> {
    return EMPTY;
  }
}
