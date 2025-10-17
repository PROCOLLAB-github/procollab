/** @format */

import {
  type AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  type OnDestroy,
  type OnInit,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { concatMap, fromEvent, map, noop, of, Subscription, tap, throttleTime } from "rxjs";
import { TrajectoriesService } from "../../trajectories.service";
import { TrajectoryComponent } from "../shared/trajectory/trajectory.component";
import { Trajectory } from "projects/skills/src/models/trajectory.model";

/**
 * Компонент списка траекторий
 * Отображает список доступных траекторий с поддержкой пагинации
 * Поддерживает два режима: "all" (все траектории) и "my" (пользовательские)
 * Реализует бесконечную прокрутку для загрузки дополнительных элементов
 */
@Component({
  selector: "app-list",
  standalone: true,
  imports: [CommonModule, RouterModule, TrajectoryComponent],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
})
export class TrajectoriesListComponent implements OnInit, AfterViewInit, OnDestroy {
  router = inject(Router);
  route = inject(ActivatedRoute);
  trajectoriesService = inject(TrajectoriesService);
  cdRef = inject(ChangeDetectorRef);

  totalItemsCount = signal(0);
  trajectoriesList = signal<Trajectory[]>([]);
  userTrajectory = signal<Trajectory | undefined>(undefined);
  trajectoriesPage = signal(1);
  perFetchTake = signal(20);

  type = signal<"all" | "my" | null>(null);

  subscriptions$ = signal<Subscription[]>([]);

  /**
   * Инициализация компонента
   * Определяет тип списка (all/my) и загружает начальные данные
   */
  ngOnInit(): void {
    const currentType = this.router.url.split("/").pop() as "all" | "my";
    this.type.set(currentType);

    this.route.data.pipe(map(r => r["data"])).subscribe(data => {
      if (currentType === "all") {
        this.trajectoriesList.set(data as Trajectory[]);
        this.totalItemsCount.set((data as Trajectory[]).length);
      } else {
        this.userTrajectory.set(data as Trajectory);
      }
    });
  }

  /**
   * Настройка обработчика прокрутки после инициализации представления
   * Подписывается на события прокрутки для реализации бесконечной загрузки
   */
  ngAfterViewInit(): void {
    const target = document.querySelector(".office__body");
    if (target) {
      const scrollEvents$ = fromEvent(target, "scroll")
        .pipe(
          concatMap(() => this.onScroll()),
          throttleTime(500)
        )
        .subscribe(noop);
      this.subscriptions$().push(scrollEvents$);
    }
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   */
  ngOnDestroy(): void {
    this.subscriptions$().forEach(s => s.unsubscribe());
  }

  /**
   * Обработчик события прокрутки
   * Проверяет достижение конца списка и загружает дополнительные элементы
   * @returns Observable с результатом загрузки или пустой объект
   */
  onScroll() {
    if (this.totalItemsCount() && this.trajectoriesList().length >= this.totalItemsCount())
      return of({});

    const target = document.querySelector(".office__body");
    if (!target) return of({});

    const diff = target.scrollTop - target.scrollHeight + target.clientHeight;

    if (diff > 0) {
      return this.onFetch(this.trajectoriesPage() * this.perFetchTake(), this.perFetchTake()).pipe(
        tap((trajectoryChunk: Trajectory[]) => {
          this.trajectoriesPage.update(page => page + 1);
          this.trajectoriesList.update(items => [...items, ...trajectoryChunk]);
        })
      );
    }

    return of({});
  }

  /**
   * Загрузка дополнительных траекторий
   * @param offset - смещение для пагинации
   * @param limit - количество элементов для загрузки
   * @returns Observable с данными траекторий
   */
  onFetch(offset: number, limit: number) {
    return this.trajectoriesService.getTrajectories(limit, offset).pipe(
      tap((res: any) => {
        this.totalItemsCount.set(res.count);
        this.trajectoriesList.update(items => [...items, ...res.results]);
      }),
      map(res => res)
    );
  }

  hasItems = computed(() => {
    return this.type() === "all" ? this.trajectoriesList().length > 0 : !!this.userTrajectory();
  });
}
