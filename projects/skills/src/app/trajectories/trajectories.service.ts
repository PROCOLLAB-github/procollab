/** @format */

import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApiService } from "@corelib";
import { plainToInstance } from "class-transformer";
import { BehaviorSubject, catchError, map, Observable, of } from "rxjs";
import {
  Student,
  Trajectory,
  TrajectorySkills,
  UserTrajectory,
} from "../../models/trajectory.model";

@Injectable({
  providedIn: "root",
})
export class TrajectoriesService {
  constructor(private readonly apiService: ApiService) {}

  getTrajectories(limit: number, offset: number) {
    const params = new HttpParams();

    params.set("limit", limit);
    params.set("offset", offset);

    return this.apiService.get<Trajectory[]>("/trajectories/");
  }

  getMyTrajectory() {
    return this.apiService.get<Trajectory[]>("/trajectories/").pipe(
      map(track => {
        const choosedTrajctory = track.find(trajectory => trajectory.isActiveForUser === true);

        return [choosedTrajctory];
      })
    );
  }

  getOne(id: number) {
    return this.apiService.get<Trajectory>("/trajectories/" + id);
  }

  getUserTrajectoryInfo() {
    return this.apiService.get<UserTrajectory>("/trajectories/user-trajectory/");
  }

  getMentorStudents() {
    return this.apiService.get<Student[]>("/trajectories/mentor/students/");
  }

  getIndividualSkills() {
    return this.apiService
      .get<UserTrajectory["individualSkills"][] | any>("/trajectories/individual-skills/")
      .pipe(
        map(response => {
          if (Array.isArray(response) && response.length > 0) {
            return response[0].skills || [];
          }
          return [];
        }),
        catchError(error => {
          console.log("Error with fetch individual skills", error);
          return of([]);
        })
      );
  }

  updateMeetings(id: number, initialMeeting: boolean, finalMeeting: boolean) {
    const body = {
      meeting_id: id,
      initial_meeting: initialMeeting,
      final_meeting: finalMeeting,
    };

    return this.apiService.post<typeof body>("/trajectories/meetings/update/", body);
  }

  activateTrajectory(trajectoryId: number) {
    return this.apiService.post("/trajectories/user-trajectory/create/", {
      trajectory_id: trajectoryId,
    });
  }
}
