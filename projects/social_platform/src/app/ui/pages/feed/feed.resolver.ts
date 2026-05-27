/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { map } from "rxjs";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { FeedItem } from "@domain/feed/feed-item.model";
import { FetchFeedUseCase } from "@api/feed/use-cases/fetch-feed.use-case";

/** Предзагружает ленту новостей. */
export const FeedResolver: ResolveFn<ApiPagination<FeedItem>> = route => {
  const fetchFeedUseCase = inject(FetchFeedUseCase);

  // Загружаем первую страницу ленты (offset: 0, limit: 20)
  // По умолчанию включаем вакансии, новости и проекты
  return fetchFeedUseCase
    .execute(0, 20, route.queryParams["includes"] ?? ["vacancy", "news", "project"])
    .pipe(
      map(result =>
        result.ok
          ? result.value
          : {
              count: 0,
              results: [],
              next: "",
              previous: "",
            }
      )
    );
};
