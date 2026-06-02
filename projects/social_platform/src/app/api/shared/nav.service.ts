/** @format */

import { Injectable } from "@angular/core";
import { distinctUntilChanged, ReplaySubject } from "rxjs";

/** Сервис для управления навигацией и заголовками страниц. */
@Injectable({
  providedIn: "root",
})
export class NavService {
  navTitle$ = new ReplaySubject<string>(1);

  navTitle = this.navTitle$.asObservable().pipe(distinctUntilChanged());

  setNavTitle(title: string): void {
    this.navTitle$.next(title);
  }
}
