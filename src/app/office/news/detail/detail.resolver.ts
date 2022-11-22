/** @format */

import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { New } from "../../models/article.model";
import { AdvertService } from "../../services/advert.service";

@Injectable({
  providedIn: "root"
})
export class NewsDetailResolver implements Resolve<New> {
  constructor(private advertService: AdvertService) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<New> {
    return this.advertService.getOne(Number(route.paramMap.get("advertId")));
  }
}
