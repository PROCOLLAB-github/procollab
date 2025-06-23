/** @format */

import { inject, Injectable } from "@angular/core";
import { SkillsApiService } from "@corelib";
import { ApiPagination } from "../../../models/api-pagination.model";
import { Skill, TasksResponse } from "../../../models/skill.model";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class SkillService {
  apiService = inject(SkillsApiService);
  private skillId: number | null = null;
  private storageKey = "skillId";

  getAll() {
    return this.apiService.get<ApiPagination<Skill>>("/courses/all-skills/");
  }

  getAllMarked(limit = 5, offset = 0) {
    return this.apiService.get<ApiPagination<Skill>>(
      "/courses/choose-skills/",
      new HttpParams({
        fromObject: {
          limit,
          offset,
        },
      })
    );
  }

  getDetail(skillId: number) {
    return this.apiService.get<Skill>(`/courses/skill-details/${skillId}`);
  }

  getTasks(skillId: number) {
    return this.apiService.get<TasksResponse>(`/courses/tasks-of-skill/${skillId}`);
  }

  setSkillId(id: number) {
    this.skillId = id;
    localStorage.setItem(this.storageKey, JSON.stringify(id));
  }

  getSkillId() {
    const skillValue = localStorage.getItem(this.storageKey);
    return skillValue ? JSON.parse(skillValue) : null;
  }
}
