/** @format */

import {
  type AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  type OnInit,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { concatMap, fromEvent, map, noop, of, type Subscription, tap, throttleTime } from "rxjs";
import { WebinarComponent } from "../shared/webinar/webinar.component";
import type { Webinar } from "projects/skills/src/models/webinars.model";
import { WebinarService } from "../services/webinar.service";
import type { ApiPagination } from "projects/skills/src/models/api-pagination.model";

/**
 * Компонент списка вебинаров
 *
 * Универсальный компонент для отображения как актуальных вебинаров,
 * так и записей завершенных вебинаров. Поддерживает бесконечную прокрутку
 * для постепенной загрузки контента.
 *
 * Функциональность:
 * - Отображение списка вебинаров в зависимости от типа (актуальные/записи)
 * - Бесконечная прокрутка для загрузки дополнительного контента
 * - Автоматическое определение типа контента по URL
 * - Оптимизированная загрузка данных порциями
 */
@Component({
  selector: "app-list",
  standalone: true,
  imports: [CommonModule, RouterModule, WebinarComponent],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
})
export class WebinarsListComponent implements OnInit, AfterViewInit {
  // Внедрение зависимостей
  router = inject(Router);
  route = inject(ActivatedRoute);
  webinarService = inject(WebinarService);
  cdRef = inject(ChangeDetectorRef);

  // Сигналы для управления состоянием
  totalItemsCount = signal(0);
  webinarList = signal<Webinar[]>([]);
  recordsList = signal<Webinar[]>([]);
  webinarPage = signal(1);
  perFetchTake = signal(20);

  // Тип отображаемого контента
  type = signal<"actual" | "records" | null>(null);

  // Управление подписками
  subscriptions$ = signal<Subscription[]>([]);

  /**
   * Инициализация компонента
   *
   * Определяет тип контента по URL и загружает соответствующие данные
   * из резолвера маршрута
   */
  ngOnInit(): void {
    // Определение типа контента по последнему сегменту URL
    this.type.set(this.router.url.split("/").slice(-1)[0] as "actual" | "records");

    // Получение данных из резолвера в зависимости от типа
    const routeData$ =
      this.type() === "actual"
        ? this.route.data.pipe(map(r => r["data"]))
        : this.route.data.pipe(map(r => r["data"]));

    const subscription = routeData$.subscribe((vacancy: ApiPagination<Webinar>) => {
      if (this.type() === "actual") {
        this.webinarList.set(vacancy.results as Webinar[]);
      } else if (this.type() === "records") {
        this.recordsList.set(vacancy.results as Webinar[]);
      }
      this.totalItemsCount.set(vacancy.count);
    });

    this.subscriptions$().push(subscription);
  }

  /**
   * Настройка бесконечной прокрутки после инициализации представления
   *
   * Подписывается на события прокрутки контейнера и запускает
   * загрузку дополнительных данных при достижении конца списка
   */
  ngAfterViewInit(): void {
    const target = document.querySelector(".office__body");
    if (target) {
      const scrollEvents$ = fromEvent(target, "scroll")
        .pipe(
          concatMap(() => this.onScroll()),
          throttleTime(500) // Ограничение частоты запросов
        )
        .subscribe(noop);
      this.subscriptions$().push(scrollEvents$);
    }
  }

  /**
   * Обработчик события прокрутки
   *
   * Проверяет, достиг ли пользователь конца списка, и если да,
   * загружает следующую порцию данных
   *
   * @returns Observable с новыми данными или пустой Observable
   */
  onScroll() {
    // Проверка, загружены ли все доступные элементы
    if (this.totalItemsCount() && this.recordsList().length >= this.totalItemsCount())
      return of({});

    if (this.totalItemsCount() && this.webinarList().length >= this.totalItemsCount())
      return of({});

    const target = document.querySelector(".office__body");
    if (!target) return of({});

    // Вычисление позиции прокрутки
    const diff = target.scrollTop - target.scrollHeight + target.clientHeight;

    // Если достигнут конец списка, загружаем следующую порцию
    if (diff > 0) {
      return this.onFetch(this.webinarPage() * this.perFetchTake(), this.perFetchTake()).pipe(
        tap((webinarChunk: Webinar[]) => {
          if (this.type() === "actual") {
            this.webinarPage.update(page => page + 1);
            this.webinarList.update(items => [...items, ...webinarChunk]);
          } else if (this.type() === "records") {
            this.webinarPage.update(page => page + 1);
            this.recordsList.update(items => [...items, ...webinarChunk]);
          }
        })
      );
    }

    return of({});
  }

  /**
   * Загрузка дополнительных данных
   *
   * Выполняет запрос к API для получения следующей порции вебинаров
   * в зависимости от текущего типа контента
   *
   * @param offset - смещение для пагинации
   * @param limit - количество элементов для загрузки
   * @returns Observable с новыми данными
   */
  onFetch(offset: number, limit: number) {
    if (this.type() === "actual") {
      return this.webinarService.getActualWebinars(limit, offset).pipe(
        tap((res: any) => {
          this.totalItemsCount.set(res.count);
          this.webinarList.update(items => [...items, ...res.results]);
        }),
        map(res => res)
      );
    } else if (this.type() === "records") {
      return this.webinarService.getRecords(limit, offset).pipe(
        tap((res: any) => {
          this.totalItemsCount.set(res.count);
          this.recordsList.update(items => [...items, ...res.results]);
        }),
        map(res => res)
      );
    }

    return of([]);
  }
}
