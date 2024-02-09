/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "@core/services";
import { Observable } from "rxjs";
import { FeedItem } from "@office/feed/models/feed-item.model";

@Injectable({
  providedIn: "root",
})
export class FeedService {
  constructor(private readonly apiService: ApiService) {}

  getFeed(): Observable<FeedItem[]> {
    return this.apiService.get("/feed/");
  }
}
