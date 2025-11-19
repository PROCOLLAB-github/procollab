/** @format */

import { Injectable } from "@angular/core";
import { Project } from "@office/models/project.model";
import { BehaviorSubject, filter, map } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ProjectDataService {
  private projectSubject = new BehaviorSubject<Project | undefined>(undefined);
  project$ = this.projectSubject.asObservable();

  setProject(project: Project) {
    this.projectSubject.next(project);
  }

  getTeam() {
    return this.project$.pipe(
      map(project => project?.collaborators),
      filter(team => !!team)
    );
  }

  getVacancies() {
    return this.project$.pipe(
      map(project => project?.vacancies),
      filter(vacancies => !!vacancies)
    );
  }

  getProjectLeaderId() {
    return this.project$.pipe(map(project => project?.leader));
  }

  getProjectId() {
    return this.project$.pipe(map(project => project?.id));
  }
}
