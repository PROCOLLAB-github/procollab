/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { User } from "@auth/models/user.model";
import { AuthService } from "@auth/services";
import { map, Observable } from "rxjs";
import { AsyncPipe } from "@angular/common";
import { Project } from "@office/models/project.model";
import { InfoCardComponent } from "@office/shared/info-card/info-card.component";

/**
 * Компонент для отображения проектов пользователя
 *
 * Отображает два типа проектов:
 * 1. Проекты, в которых пользователь является участником
 * 2. Проекты, на которые пользователь подписан
 *
 * Функциональность:
 * - Получение данных пользователя и его подписок из родительского резолвера
 * - Отображение проектов в виде карточек с возможностью перехода к деталям
 * - Адаптивная сетка для отображения проектов
 * - Различное отображение для собственного профиля и профиля другого пользователя
 *
 * @implements OnInit - для инициализации компонента
 */
@Component({
  selector: "app-projects",
  templateUrl: "./projects.component.html",
  styleUrl: "./projects.component.scss",
  standalone: true,
  imports: [RouterLink, AsyncPipe, InfoCardComponent],
})
export class ProfileProjectsComponent implements OnInit {
  constructor(private readonly route: ActivatedRoute, public readonly authService: AuthService) {}

  user?: Observable<User> = this.route.parent?.data.pipe(map(r => r["data"][0]));
  subs?: Observable<Project[]> = this.route.parent?.data.pipe(map(r => r["data"][1]));
  loggedUserId: Observable<number> = this.authService.profile.pipe(map(user => user.id));

  ngOnInit(): void {}
}
