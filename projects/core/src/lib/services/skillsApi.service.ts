/** @format */

import { Inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ApiService } from "./api.service";
import { SKILLS_API_URL } from "@corelib";

@Injectable({ providedIn: "root" })
export class SkillsApiService extends ApiService {
  constructor(http: HttpClient, @Inject(SKILLS_API_URL) apiUrl: string) {
    super(http, apiUrl);
  }
}
