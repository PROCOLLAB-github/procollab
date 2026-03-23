/** @format */

import { computed, Injectable, signal } from "@angular/core";
import { DirectionItem, directionItemBuilder } from "@utils/helpers/directionItemBuilder";
import { Project } from "projects/social_platform/src/app/domain/project/project.model";

@Injectable({ providedIn: "root" })
export class ProjectsDetailUIInfoService {
  readonly collaborators = computed(() => this.project()?.collaborators);
  readonly vacancies = computed(() => this.project()?.vacancies);
  readonly leaderId = computed(() => this.project()?.leader);
  readonly projectId = computed(() => this.project()?.id);
  readonly goals = computed(() => this.project()?.goals);

  readonly project = signal<Project | undefined>(undefined);
  readonly loggedUserId = signal<number>(0);

  readonly profileId = signal<number>(0); // ID текущего пользователя

  // Состояние компонента
  readonly isCompleted = signal<boolean>(false); // Флаг завершенности проекта
  readonly directions = signal<DirectionItem[]>([]);

  applySetProject(project: Project) {
    this.project.set(project);
  }

  applySetLoggedUserId(type: "logged" | "profile", profileId: number): void {
    type === "logged" ? this.loggedUserId.set(profileId) : this.profileId.set(profileId);
  }

  applyDirectionItems(): void {
    this.directions.set(
      directionItemBuilder(
        5,
        ["проблема", "целевая аудитория", "актуаль-сть", "цели", "партнеры"],
        ["key", "smile", "graph", "goal", "team"],
        [
          this.project()!.problem,
          this.project()!.targetAudience,
          this.project()!.actuality,
          this.project()!.goals,
          this.project()!.partners,
        ],
        ["string", "string", "string", "array", "array"]
      ) ?? []
    );
  }

  applyRemoveCollaborator(userId: number): void {
    this.project.update(project => {
      if (!project) return;

      return {
        ...project,
        collaborators: this.collaborators()?.filter(c => c.userId !== userId) ?? [],
      };
    });
  }

  applyMembersManipulation(id: number): void {
    this.project.update(p =>
      p ? { ...p, collaborators: p.collaborators.filter(c => c.userId !== id) } : p
    );
  }

  removeCollaborators(userId: number): void {
    this.project.update(project => {
      if (!project) return;

      return {
        ...project,
        collaborators: this.collaborators()?.filter(c => c.userId !== userId) ?? [],
      };
    });
  }
}
