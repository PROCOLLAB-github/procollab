/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";

@Injectable({
  providedIn: "root",
})
export class SkillService {
  apiService = inject(ApiService);

  getAll() {
    return this.apiService.get("/courses/all-skills/");
  }
}
