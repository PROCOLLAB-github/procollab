/** @format */

import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { map } from "rxjs";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { FeedItem, FeedItemType } from "@domain/feed/feed-item.model";
import { FetchFeedUseCase } from "@api/feed/use-cases/fetch-feed.use-case";
import { FILTER_SPLIT_SYMBOL } from "@core/consts/other/filter-split-symbol.const";

const DEFAULT_FEED_TYPES: FeedItemType[] = ["vacancy", "news", "project"];

/** Предзагружает ленту новостей. */
export const FeedResolver: ResolveFn<ApiPagination<FeedItem>> = route => {
  const fetchFeedUseCase = inject(FetchFeedUseCase);

  // Загружаем первую страницу ленты (offset: 0, limit: 20)
  // По умолчанию включаем вакансии, новости и проекты
  return fetchFeedUseCase
    .execute(0, 20, route.queryParams["includes"] ?? DEFAULT_FEED_TYPES.join(FILTER_SPLIT_SYMBOL))
    .pipe(
      map(result =>
        result.ok
          ? result.value
          : {
              count: 0,
              results: [],
              next: "",
              previous: "",
            },
      ),
    );
};
