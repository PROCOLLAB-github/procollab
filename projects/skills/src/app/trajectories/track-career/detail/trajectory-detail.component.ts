/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, signal, type OnDestroy, type OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import type { Trajectory } from "projects/skills/src/models/trajectory.model";
import { filter, map, type Subscription } from "rxjs";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { ButtonComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";

/**
 * Компонент детального просмотра траектории
 * Отображает навигационную панель и служит контейнером для дочерних компонентов
 * Управляет состоянием выбранной траектории и ID траектории из URL
 */
@Component({
  selector: "app-trajectory-detail",
  standalone: true,
  imports: [CommonModule, RouterOutlet, AvatarComponent, ButtonComponent, ModalComponent],
  templateUrl: "./trajectory-detail.component.html",
  styleUrl: "./trajectory-detail.component.scss",
})
export class TrajectoryDetailComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);

  subscriptions$: Subscription[] = [];

  trajectory = signal<Trajectory | undefined>(undefined);
  isDisabled = signal<boolean>(false);
  isTaskDetail = signal<boolean>(false);

  /**
   * Инициализация компонента
   * Подписывается на параметры маршрута и данные траектории
   */
  ngOnInit(): void {
    this.route.data
      .pipe(
        map(data => data["data"]),
        filter(trajectory => !!trajectory)
      )
      .subscribe({
        next: trajectory => {
          this.trajectory.set(trajectory[0]);
        },
      });

    this.isTaskDetail.set(this.router.url.includes("task"));
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   * Отписывается от всех активных подписок
   */
  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  /**
   * Перенаправляет на страницу с информацией в завивисимости от listType
   */
  redirectDetailInfo(trackId?: number): void {
    if (this.trajectory()) {
      this.router.navigateByUrl(`/trackCar/${trackId}`);
    } else {
      this.router.navigateByUrl("/trackCar/all");
    }
  }
}
