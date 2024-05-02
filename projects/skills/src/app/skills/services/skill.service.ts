/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { ApiPagination } from "../../../models/api-pagination.model";
import { Skill, SkillDetail, Task, TasksResponse } from "../../../models/skill.model";
import { map } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SkillService {
  apiService = inject(ApiService);

  getAll() {
    return this.apiService.get<ApiPagination<Skill>>("/courses/all-skills/");
  }

  getDetail(skillId: number) {
    return this.apiService
      .get<{ skills: { [key: number]: SkillDetail } }>(`/courses/skill-details/${skillId}`)
      .pipe(map(r => r.skills[1]));
  }

  getTasks(skillId: number) {
    return this.apiService.get<TasksResponse>(`/courses/tasks-of-skill/${skillId}`);
  }
}
