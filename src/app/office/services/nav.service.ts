/** @format */

import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class NavService {
  constructor() {}

  navTitle = "";

  setNavTitle(title: string): void {
    this.navTitle = title;
  }
}
