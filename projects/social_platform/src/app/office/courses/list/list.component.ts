/** @format */

import {
  type AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  type OnDestroy,
  type OnInit,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { concatMap, fromEvent, map, noop, of, Subscription, tap, throttleTime } from "rxjs";
import { TrajectoriesService } from "../trajectories.service";
import { CourseComponent } from "../shared/course/course.component";
import { Course } from "@office/models/courses.model";

/**
 * Компонент списка траекторий
 * Отображает список доступных траекторий с поддержкой пагинации
 * Поддерживает два режима: "all" (все траектории) и "my" (пользовательские)
 * Реализует бесконечную прокрутку для загрузки дополнительных элементов
 */
@Component({
  selector: "app-list",
  standalone: true,
  imports: [CommonModule, RouterModule, CourseComponent],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
})
export class CoursesListComponent implements OnInit, AfterViewInit, OnDestroy {
  router = inject(Router);
  route = inject(ActivatedRoute);
  trajectoriesService = inject(TrajectoriesService);
  cdRef = inject(ChangeDetectorRef);

  totalItemsCount = signal(0);
  coursesList = signal<Course[]>([]);
  coursesPage = signal(1);
  perFetchTake = signal(20);

  subscriptions$ = signal<Subscription[]>([]);

  /**
   * Инициализация компонента
   * Определяет тип списка (all/my) и загружает начальные данные
   */
  ngOnInit(): void {
    this.route.data.pipe(map(r => r["data"])).subscribe(data => {
      this.coursesList.set(data as any[]);
      this.totalItemsCount.set((data as any[]).length);
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
    if (this.totalItemsCount() && this.coursesList().length >= this.totalItemsCount())
      return of({});

    const target = document.querySelector(".office__body");
    if (!target) return of({});

    const diff = target.scrollTop - target.scrollHeight + target.clientHeight;

    if (diff > 0) {
      return this.onFetch(this.coursesPage() * this.perFetchTake(), this.perFetchTake()).pipe(
        tap((trajectoryChunk: any[]) => {
          this.coursesPage.update(page => page + 1);
          this.coursesList.update(items => [...items, ...trajectoryChunk]);
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
        this.coursesList.update(items => [...items, ...res.results]);
      }),
      map(res => res)
    );
  }
}
