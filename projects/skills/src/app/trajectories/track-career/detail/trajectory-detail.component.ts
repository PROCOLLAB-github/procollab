/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, type OnDestroy, type OnInit } from "@angular/core";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { BarComponent } from "@ui/components";
import type { Trajectory } from "projects/skills/src/models/trajectory.model";
import { map, type Subscription } from "rxjs";

/**
 * Компонент детального просмотра траектории
 * Отображает навигационную панель и служит контейнером для дочерних компонентов
 * Управляет состоянием выбранной траектории и ID траектории из URL
 */
@Component({
  selector: "app-trajectory-detail",
  standalone: true,
  imports: [CommonModule, BarComponent, RouterOutlet],
  templateUrl: "./trajectory-detail.component.html",
  styleUrl: "./trajectory-detail.component.scss",
})
export class TrajectoryDetailComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);

  subscriptions$: Subscription[] = [];

  trajectory?: Trajectory;
  trackId?: string;

  /**
   * Инициализация компонента
   * Подписывается на параметры маршрута и данные траектории
   */
  ngOnInit(): void {
    const trackIdSub = this.route.params.subscribe(params => {
      this.trackId = params["trackId"];
    });

    const trajectorySub$ = this.route.data.pipe(map(r => r["data"])).subscribe(trajectory => {
      this.trajectory = trajectory;
    });

    trajectorySub$ && this.subscriptions$.push(trajectorySub$);
    trackIdSub && this.subscriptions$.push(trackIdSub);
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   * Отписывается от всех активных подписок
   */
  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }
}
