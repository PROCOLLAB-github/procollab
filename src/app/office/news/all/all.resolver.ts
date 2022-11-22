/** @format */

import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { New } from "../../models/article.model";
import { AdvertService } from "../../services/advert.service";

@Injectable({
  providedIn: "root"
})
export class NewsAllResolver implements Resolve<New[]> {
  constructor(private advertService: AdvertService) {
  }

  resolve(): Observable<New[]> {
    return this.advertService.getAll();
  }
}
