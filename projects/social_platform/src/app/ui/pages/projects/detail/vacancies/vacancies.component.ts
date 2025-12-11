/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { IconComponent } from "@uilib";
import { ProjectDataService } from "../../../../../api/project/project-data.service";
import { Subscription } from "rxjs";
import { ProjectVacancyCardComponent } from "../../../../shared/project-vacancy-card/project-vacancy-card.component";

/**
 * Компонент страницы вакансий в деательной информации о проекте
 */
@Component({
  selector: "app-vacancies",
  templateUrl: "./vacancies.component.html",
  styleUrl: "./vacancies.component.scss",
  imports: [CommonModule, IconComponent, ProjectVacancyCardComponent],
  standalone: true,
})
export class ProjectVacanciesComponent implements OnInit, OnDestroy {
  // сервис для работы с данными детальной информации проекта
  private readonly projectDataService = inject(ProjectDataService);

  // массив пользователей в команде
  vacancies = this.projectDataService.vacancies;

  // массив подписок
  subscriptions: Subscription[] = [];

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions.forEach($ => $.unsubscribe());
  }
}
