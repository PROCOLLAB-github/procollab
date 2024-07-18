/** @format */

import { Injectable } from "@angular/core";
import { SkillsGroup } from "../models/skills-group";
import { Observable } from "rxjs";
import { ApiService } from "@corelib";
import { Skill } from "../models/skill";
import { ApiPagination } from "@office/models/api-pagination.model";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class SkillsService {
  constructor(private apiService: ApiService) {}

  getSkillsNested(): Observable<SkillsGroup[]> {
    return this.apiService.get("/core/skills/nested");
  }

  getSkillsInline(search: string, limit: number, offset: number): Observable<ApiPagination<Skill>> {
    return this.apiService.get(
      "/core/skills/inline",
      new HttpParams({ fromObject: { limit, offset, name__icontains: search } }),
    );
  }
}
