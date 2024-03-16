/** @format */

import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { New } from "@models/article.model";
import { ApiService } from "projects/core";
import { plainToInstance } from "class-transformer";

@Injectable({
  providedIn: "root",
})
export class AdvertService {
  constructor(private readonly apiService: ApiService) {}

  getAll(): Observable<New[]> {
    return this.apiService.get<New[]>("/news/").pipe(map(adverts => plainToInstance(New, adverts)));
  }

  getOne(advertId: number): Observable<New> {
    return this.apiService
      .get(`/news/${advertId}/`)
      .pipe(map(advert => plainToInstance(New, advert)));
  }
}
