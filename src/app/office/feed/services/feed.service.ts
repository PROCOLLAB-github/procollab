/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "@core/services";
import { Observable } from "rxjs";
import { FeedItem } from "@office/feed/models/feed-item.model";
import { ApiPagination } from "@models/api-pagination.model";

@Injectable({
  providedIn: "root",
})
export class FeedService {
  constructor(private readonly apiService: ApiService) {}

  getFeed(): Observable<ApiPagination<FeedItem>> {
    return this.apiService.get("/feed/");
  }
}
