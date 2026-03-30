/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "@domain/other/api-pagination.model";
import { FeedItem } from "@domain/feed/feed-item.model";

@Injectable({ providedIn: "root" })
export class FeedHttpAdapter {
  private readonly FEED_URL = "/feed";

  private readonly apiService = inject(ApiService);

  /**
   * Получает элементы ленты с пагинацией и фильтрацией
   *
   * @param offset - смещение для пагинации
   * @param limit - количество элементов
   * @param type - строка фильтра типов, объединённых через "|" (например "vacancy|news|project")
   * @returns Observable<ApiPagination<FeedItem>>
   */
  fetchFeed(offset: number, limit: number, type: string): Observable<ApiPagination<FeedItem>> {
    return this.apiService.get<ApiPagination<FeedItem>>(
      `${this.FEED_URL}/`,
      new HttpParams({ fromObject: { limit, offset, type } })
    );
  }
}
