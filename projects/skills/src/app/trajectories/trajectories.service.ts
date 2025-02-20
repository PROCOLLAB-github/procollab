/** @format */

import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { plainToInstance } from "class-transformer";
import { BehaviorSubject, map, Observable } from "rxjs";
import { Trajectory, TrajectorySkills } from "../../models/trajectory.model";

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

  getTrajectorySkills(id: number) {
    return this.apiService.get<TrajectorySkills>("/trajectories/trajectories/" + id + "/skills");
  }
}
