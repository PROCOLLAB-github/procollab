/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { map, Subscription } from "rxjs";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { Project } from "@models/project.model";
import { AuthService } from "@auth/services";
import { AsyncPipe } from "@angular/common";
import { BarComponent } from "@ui/components";

/**
 * Компонент детального просмотра проекта
 *
 * Функциональность:
 * - Загружает данные проекта из резолвера
 * - Определяет, является ли текущий пользователь участником проекта
 * - Управляет подписками на Observable
 *
 * Принимает:
 * - Данные проекта через ActivatedRoute
 * - Профиль пользователя через AuthService
 *
 * Предоставляет:
 * - project - данные текущего проекта
 * - isInProject$ - Observable, показывающий участие пользователя в проекте
 */
@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrl: "./detail.component.scss",
  standalone: true,
  imports: [RouterOutlet, AsyncPipe, BarComponent],
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  constructor(private readonly route: ActivatedRoute, private readonly authService: AuthService) {}

  ngOnInit(): void {
    // Подписка на данные проекта из резолвера
    const projectSub$ = this.route.data.pipe(map(r => r["data"][0])).subscribe(project => {
      this.project = project;
    });
    projectSub$ && this.subscriptions$.push(projectSub$);
  }

  ngOnDestroy(): void {
    // Отписка от всех подписок для предотвращения утечек памяти
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  /** Массив всех подписок компонента */
  subscriptions$: Subscription[] = [];

  /** Данные текущего проекта */
  project?: Project;

  /** Observable, определяющий участие текущего пользователя в проекте */
  isInProject$ = this.authService.profile.pipe(
    map(profile => this.project?.collaborators.map(person => person.userId).includes(profile.id))
  );
}
