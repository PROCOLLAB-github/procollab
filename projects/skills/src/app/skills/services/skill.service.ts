/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { ApiPagination } from "../../../models/api-pagination.model";
import { Skill, SkillDetail, TasksResponse } from "../../../models/skill.model";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class SkillService {
  apiService = inject(ApiService);

  getAll(limit: number = 3, offset: number = 0) {
    return this.apiService.get<ApiPagination<Skill>>("/courses/all-skills/", new HttpParams({
      fromObject: {
        limit,
        offset,
      },
    }));
  }

  getDetail(skillId: number) {
    return this.apiService.get<SkillDetail>(`/courses/skill-details/${skillId}`);
  }

  getTasks(skillId: number) {
    return this.apiService.get<TasksResponse>(`/courses/tasks-of-skill/${skillId}`);
  }
}
