/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { IconComponent } from "@uilib";
import { ProjectDataService } from "../services/project-data.service";
import { Collaborator } from "@office/models/collaborator.model";
import { InfoCardComponent } from "@office/features/info-card/info-card.component";
import { Subscription } from "rxjs";
import { Project } from "@office/models/project.model";

/**
 * Компонент страницы команды в деательной информации о проекте
 */
@Component({
  selector: "app-project-eam",
  templateUrl: "./team.component.html",
  styleUrl: "./team.component.scss",
  imports: [CommonModule, IconComponent, InfoCardComponent],
  standalone: true,
})
export class ProjectTeamComponent implements OnInit, OnDestroy {
  // сервис для работы с данными детальной информации проекта
  private readonly projectDataService = inject(ProjectDataService);

  // массив пользователей в команде
  team?: Project["collaborators"];

  // массив подписок
  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    // получение данных из сервиса как потока данных и подписка на них
    const teamSub$ = this.projectDataService.getTeam().subscribe({
      next: team => {
        this.team = team;
      },
    });

    teamSub$ && this.subscriptions.push(teamSub$);
  }

  ngOnDestroy(): void {
    // отписка от поток, которые не нужны
    this.subscriptions.forEach($ => $.unsubscribe());
  }
}
