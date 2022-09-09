/** @format */

import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { Advert } from "../../models/article.model";
import { AdvertSerivce } from "../../services/advert.service";

@Injectable({
  providedIn: "root",
})
export class NewsDetailResolver implements Resolve<Advert> {
  constructor(private advertService: AdvertSerivce) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Advert> {
    return this.advertService.getOne(Number(route.paramMap.get("advertId")));
  }
}
