/** @format */

import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Advert } from "../models/article.model";
import { ApiService } from "../../core/services";
import { plainToInstance } from "class-transformer";

@Injectable({
  providedIn: "root",
})
export class AdvertSerivce {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<Advert[]> {
    return this.apiService.get<{ news: Advert[] }>("/advert/all").pipe(
      map(r => r.news),
      map(adverts => plainToInstance(Advert, adverts))
    );
  }

  getOne(advertId: number): Observable<Advert> {
    return this.apiService
      .get(`/advert/${advertId}`)
      .pipe(map(advert => plainToInstance(Advert, advert)));
  }
}
