/** @format */

import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { plainToInstance } from "class-transformer";
import { BehaviorSubject, map, Observable } from "rxjs";
import { Trajectory, TrajectorySkills, UserTrajectory } from "../../models/trajectory.model";

@Injectable({
  providedIn: "root",
})
export class TrajectoriesService {
  constructor(private readonly apiService: ApiService) {}

  getTrajectories(limit: number, offset: number) {
    const params = new HttpParams();

    params.set("limit", limit);
    params.set("offset", offset);

    return this.apiService.get<Trajectory>("/trajectories/");
  }

  getOne(id: number) {
    return this.apiService.get<Trajectory>("/trajectories/" + id);
  }

  getUserTrajectoryInfo() {
    return this.apiService.get<UserTrajectory>("/trajectories/user-trajectory/");
  }

  activateTrajectory(trajectoryId: number) {
    return this.apiService.post("/trajectories/user-trajectory/create/", {
      trajectory_id: trajectoryId,
    });
  }
}
