/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { Achievement, User } from "../models/user.model";
import { first, last, map, Observable } from "rxjs";
import { plainToInstance } from "class-transformer";
import { Approve } from "@office/models/skill";

@Injectable({
  providedIn: "root",
})
export class ProfileService {
  constructor(private apiService: ApiService) {}

  addAchievement(achievement: Omit<Achievement, "id">): Observable<Achievement> {
    return this.apiService
      .post("/auth/users/achievements/", achievement)
      .pipe(map(achievement => plainToInstance(Achievement, achievement)));
  }

  deleteAchievement(achievementId: string): Observable<void> {
    return this.apiService.delete(`/auth/users/achievements/${achievementId}/`);
  }

  editAchievement(
    achievementId: string,
    achievement: Omit<Achievement, "id">
  ): Observable<Achievement> {
    return this.apiService.put(`/auth/users/achievement/${achievementId}/`, achievement);
  }

  approveSkill(userId: number, skillId: number): Observable<Approve> {
    return this.apiService.post(`/auth/users/${userId}/approve_skill/${skillId}/`, {});
  }

  unApproveSkill(userId: number, skillId: number): Observable<void> {
    return this.apiService.delete(`/auth/users/${userId}/approve_skill/${skillId}/`);
  }
}
