/** @format */

import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { Advert } from "../../models/article.model";
import { AdvertSerivce } from "../../services/advert.service";

@Injectable({
  providedIn: "root",
})
export class NewsAllResolver implements Resolve<Advert[]> {
  constructor(private advertService: AdvertSerivce) {}

  resolve(): Observable<Advert[]> {
    return this.advertService.getAll();
  }
}
