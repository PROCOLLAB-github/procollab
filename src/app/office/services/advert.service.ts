/** @format */

import { Injectable } from "@angular/core";
import { map, Observable, pluck } from "rxjs";
import { Advert } from "../models/article.model";
import { ApiService } from "../../core/services";
import { plainToClass } from "class-transformer";

@Injectable({
  providedIn: "root",
})
export class AdvertSerivce {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<Advert[]> {
    return this.apiService.get<{ news: Advert[] }>("/advert/all").pipe(
      pluck("news"),
      map(adverts => plainToClass(Advert, adverts))
    );
  }

  getOne(advertId: number): Observable<Advert> {
    return this.apiService
      .get(`/advert/${advertId}`)
      .pipe(map(advert => plainToClass(Advert, advert)));
  }
}
