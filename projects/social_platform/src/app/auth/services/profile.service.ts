/** @format */

import { Injectable } from "@angular/core";
import { ApiService } from "projects/core";
import { Achievement } from "../models/user.model";
import { map, Observable } from "rxjs";
import { plainToInstance } from "class-transformer";

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
}
