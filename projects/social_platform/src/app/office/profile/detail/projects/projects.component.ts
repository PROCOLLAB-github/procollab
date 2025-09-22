/** @format */

import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { User } from "@auth/models/user.model";
import { AuthService } from "@auth/services";
import { filter, Subscription, take } from "rxjs";
import { AsyncPipe } from "@angular/common";
import { Project } from "@office/models/project.model";
import { InfoCardComponent } from "@office/features/info-card/info-card.component";
import { ProfileDataService } from "../services/profile-date.service";

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
export class ProfileProjectsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly profileDataService = inject(ProfileDataService);
  public readonly authService = inject(AuthService);

  ngOnInit(): void {
    const profileDataSub$ = this.profileDataService
      .getProfile()
      .pipe(
        filter(user => !!user),
        take(1)
      )
      .subscribe({
        next: user => {
          this.user = user;
        },
      });

    const profileIdDataSub$ = this.profileDataService
      .getProfileId()
      .pipe(
        filter(profileId => !!profileId),
        take(1)
      )
      .subscribe({
        next: profileId => {
          this.loggedUserId = profileId;
        },
      });

    const profileSubsDataSub$ = this.profileDataService
      .getProfileSubs()
      .pipe(
        filter(subs => !!subs),
        take(1)
      )
      .subscribe({
        next: subs => {
          this.subs = subs;
        },
      });

    profileDataSub$ && this.subscriptions.push(profileDataSub$);
    profileIdDataSub$ && this.subscriptions.push(profileIdDataSub$);
    profileSubsDataSub$ && this.subscriptions.push(profileSubsDataSub$);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach($ => $.unsubscribe());
  }

  user?: User;
  loggedUserId?: number;
  subs?: Project[];

  subscriptions: Subscription[] = [];
}
