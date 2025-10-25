/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { IconComponent } from "@uilib";
import { ProjectDataService } from "../services/project-data.service";
import { Project } from "@office/models/project.model";
import { Subscription } from "rxjs";
import { ProjectVacancyCardComponent } from "../shared/project-vacancy-card/project-vacancy-card.component";

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
  vacancies?: Project["vacancies"];

  // массив подписок
  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const vacanciesSub$ = this.projectDataService.getVacancies().subscribe({
      next: vacancies => {
        this.vacancies = vacancies;
      },
    });

    vacanciesSub$ && this.subscriptions.push(vacanciesSub$);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach($ => $.unsubscribe());
  }
}
