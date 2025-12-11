/** @format */

import { computed, Injectable, signal } from "@angular/core";
import { Project } from "../../domain/project/project.model";

@Injectable({
  providedIn: "root",
})
export class ProjectDataService {
  project = signal<Project | undefined>(undefined);

  setProject(project: Project) {
    this.project.set(project);
  }

  collaborators = computed(() => this.project()?.collaborators);
  vacancies = computed(() => this.project()?.vacancies);
  leaderId = computed(() => this.project()?.leader);
  projectId = computed(() => this.project()?.id);
  goals = computed(() => this.project()?.goals);
}
