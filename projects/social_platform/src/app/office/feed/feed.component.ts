/** @format */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { NewProjectComponent } from "@office/feed/shared/new-project/new-project.component";
import { ActivatedRoute } from "@angular/router";
import { FeedItem, FeedItemType } from "@office/feed/models/feed-item.model";
import { concatMap, fromEvent, map, noop, of, skip, Subscription, tap, throttleTime } from "rxjs";
import { ApiPagination } from "@models/api-pagination.model";
import { FeedService } from "@office/feed/services/feed.service";
import { ProjectNewsService } from "@office/projects/detail/services/project-news.service";
import { ProfileNewsService } from "@office/profile/detail/services/profile-news.service";
import { FeedFilterComponent } from "@office/feed/filter/feed-filter.component";
import { NewsCardComponent } from "@office/features/news-card/news-card.component";
import { OpenVacancyComponent } from "./shared/open-vacancy/open-vacancy.component";

/**
 * ОСНОВНОЙ КОМПОНЕНТ ЛЕНТЫ НОВОСТЕЙ
 *
 * Главный компонент для отображения ленты новостей, вакансий и проектов.
 * Поддерживает бесконечную прокрутку, фильтрацию и отслеживание просмотров.
 *
 * ОСНОВНЫЕ ФУНКЦИИ:
 * - Отображение элементов ленты (новости, вакансии, проекты)
 * - Бесконечная прокрутка для подгрузки новых элементов
 * - Фильтрация по типам контента
 * - Отслеживание просмотров элементов
 * - Лайки новостей
 *
 * ИСПОЛЬЗУЕМЫЕ СИГНАЛЫ:
 * - totalItemsCount: общее количество элементов
 * - feedItems: массив элементов ленты
 * - feedPage: текущая страница для пагинации
 * - includes: активные фильтры
 */
@Component({
  selector: "app-feed",
  standalone: true,
  imports: [
    CommonModule,
    NewProjectComponent,
    FeedFilterComponent,
    NewsCardComponent,
    OpenVacancyComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./feed.component.html",
  styleUrl: "./feed.component.scss",
})
export class FeedComponent implements OnInit, AfterViewInit, OnDestroy {
  route = inject(ActivatedRoute);
  projectNewsService = inject(ProjectNewsService);
  profileNewsService = inject(ProfileNewsService);
  feedService = inject(FeedService);

  /**
   * ИНИЦИАЛИЗАЦИЯ КОМПОНЕНТА
   *
   * ЧТО ДЕЛАЕТ:
   * - Загружает начальные данные из резолвера
   * - Настраивает наблюдение за изменениями фильтров
   * - Инициализирует отслеживание просмотров элементов
   */
  ngOnInit() {
    // Получаем предзагруженные данные из резолвера
    const routeData$ = this.route.data
      .pipe(map(r => r["data"]))
      .subscribe((feed: ApiPagination<FeedItem>) => {
        this.feedItems.set(feed.results);
        this.totalItemsCount.set(feed.count);

        // Настраиваем отслеживание просмотров элементов
        setTimeout(() => {
          const observer = new IntersectionObserver(this.onFeedItemView.bind(this), {
            root: document.querySelector(".office__body"),
            rootMargin: "0px 0px 0px 0px",
            threshold: 0,
          });

          document.querySelectorAll(".page__item").forEach(e => {
            observer.observe(e);
          });
        });
      });
    this.subscriptions$().push(routeData$);

    // Отслеживаем изменения параметров фильтрации
    const queryParams$ = this.route.queryParams
      .pipe(
        map(params => params["includes"]),
        tap(includes => {
          this.includes.set(includes);
        }),
        skip(1),
        concatMap(includes => {
          this.totalItemsCount.set(0);
          this.feedPage.set(0);

          return this.onFetch(0, this.perFetchTake(), includes ?? ["vacancy", "projects", "news"]);
        })
      )
      .subscribe(feed => {
        this.feedItems.set(feed);

        setTimeout(() => {
          this.feedRoot?.nativeElement.children[0].scrollIntoView({ behavior: "smooth" });
        });
      });
    this.subscriptions$().push(queryParams$);
  }

  /**
   * НАСТРОЙКА БЕСКОНЕЧНОЙ ПРОКРУТКИ
   *
   * ЧТО ДЕЛАЕТ:
   * - Подписывается на события прокрутки
   * - Загружает новые элементы при достижении конца списка
   */
  ngAfterViewInit() {
    const target = document.querySelector(".office__body");
    if (target) {
      const scrollEvents$ = fromEvent(target, "scroll")
        .pipe(
          concatMap(() => this.onScroll()),
          throttleTime(500) // Ограничиваем частоту запросов
        )
        .subscribe(noop);

      this.subscriptions$().push(scrollEvents$);
    }
  }

  ngOnDestroy() {
    this.subscriptions$().forEach($ => $.unsubscribe());
  }

  @ViewChild("feedRoot") feedRoot?: ElementRef<HTMLElement>;

  // Сигналы состояния компонента
  totalItemsCount = signal(0); // Общее количество элементов
  feedItems = signal<FeedItem[]>([]); // Массив элементов ленты
  feedPage = signal(1); // Текущая страница
  perFetchTake = signal(20); // Количество элементов за запрос
  includes = signal<FeedItemType[]>([]); // Активные фильтры

  subscriptions$ = signal<Subscription[]>([]);

  /**
   * ОБРАБОТКА ЛАЙКОВ НОВОСТЕЙ
   *
   * ЧТО ПРИНИМАЕТ:
   * @param newsId - ID новости для лайка/дизлайка
   *
   * ЧТО ДЕЛАЕТ:
   * - Переключает состояние лайка
   * - Обновляет счетчик лайков
   * - Различает новости проектов и профилей
   */
  onLike(newsId: number) {
    const itemIdx = this.feedItems().findIndex(n => n.content.id === newsId);

    const item = this.feedItems()[itemIdx];
    if (!item || item.typeModel !== "news") return;

    // Определяем тип новости по структуре contentObject
    if ("email" in item.content.contentObject) {
      this.profileNewsService
        .toggleLike(
          item.content.contentObject.id as unknown as string,
          newsId,
          !item.content.isUserLiked
        )
        .subscribe(() => {
          item.content.likesCount = item.content.isUserLiked
            ? item.content.likesCount - 1
            : item.content.likesCount + 1;
          item.content.isUserLiked = !item.content.isUserLiked;

          this.feedItems.update(items => {
            const newItems = [...items];
            newItems.splice(itemIdx, 1, item);
            return newItems;
          });
        });
    } else if ("leader" in item.content.contentObject) {
      this.projectNewsService
        .toggleLike(
          item.content.contentObject.id as unknown as string,
          newsId,
          !item.content.isUserLiked
        )
        .subscribe(() => {
          item.content.likesCount = item.content.isUserLiked
            ? item.content.likesCount - 1
            : item.content.likesCount + 1;
          item.content.isUserLiked = !item.content.isUserLiked;

          this.feedItems.update(items => {
            const newItems = [...items];
            newItems.splice(itemIdx, 1, item);
            return newItems;
          });
        });
    }
  }

  /**
   * ОТСЛЕЖИВАНИЕ ПРОСМОТРОВ ЭЛЕМЕНТОВ
   *
   * ЧТО ПРИНИМАЕТ:
   * @param entries - массив элементов, попавших в область видимости
   *
   * ЧТО ДЕЛАЕТ:
   * - Отмечает новости как прочитанные при попадании в область видимости
   * - Различает новости проектов и профилей
   */
  onFeedItemView(entries: IntersectionObserverEntry[]): void {
    const items = entries
      .map(e => {
        return Number((e.target as HTMLElement).dataset["id"]);
      })
      .map(id => this.feedItems().find(item => item.content.id === id))
      .filter(Boolean) as FeedItem[];

    const projectNews = items.filter(
      item => item.typeModel === "news" && !("email" in item.content.contentObject)
    );
    const profileNews = items.filter(
      item => item.typeModel === "news" && "email" in item.content.contentObject
    );

    // Отмечаем новости проектов как прочитанные
    projectNews.forEach(news => {
      if (news.typeModel !== "news") return;
      this.projectNewsService
        .readNews(news.content.contentObject.id, [news.content.id])
        .subscribe(noop);
    });

    // Отмечаем новости профилей как прочитанные
    profileNews.forEach(news => {
      if (news.typeModel !== "news") return;
      this.profileNewsService
        .readNews(news.content.contentObject.id, [news.content.id])
        .subscribe(noop);
    });
  }

  /**
   * ОБРАБОТКА ПРОКРУТКИ ДЛЯ БЕСКОНЕЧНОЙ ЗАГРУЗКИ
   *
   * ЧТО ВОЗВРАЩАЕТ:
   * @returns Observable с новыми элементами или пустой объект
   *
   * ЧТО ДЕЛАЕТ:
   * - Проверяет, достигнут ли конец списка
   * - Загружает следующую порцию элементов при необходимости
   */
  onScroll() {
    // Проверяем, загружены ли все элементы
    if (this.totalItemsCount() && this.feedItems().length >= this.totalItemsCount()) return of({});

    const target = document.querySelector(".office__body");
    if (!target || !this.feedRoot) return of({});

    // Вычисляем, нужно ли загружать новые элементы
    const diff =
      target.scrollTop -
      this.feedRoot.nativeElement.getBoundingClientRect().height +
      window.innerHeight;

    if (diff > 0) {
      return this.onFetch(
        this.feedPage() * this.perFetchTake(),
        this.perFetchTake(),
        this.includes()
      ).pipe(
        tap((feedChunk: FeedItem[]) => {
          this.feedPage.update(page => page + 1);
          this.feedItems.update(items => [...items, ...feedChunk]);
        })
      );
    }

    return of({});
  }

  /**
   * ЗАГРУЗКА ЭЛЕМЕНТОВ ЛЕНТЫ
   *
   * ЧТО ПРИНИМАЕТ:
   * @param offset - смещение для пагинации
   * @param limit - количество элементов для загрузки
   * @param includes - типы элементов для включения в результат
   *
   * ЧТО ВОЗВРАЩАЕТ:
   * @returns Observable<FeedItem[]> - массив элементов ленты
   */
  onFetch(
    offset: number,
    limit: number,
    includes: FeedItemType[] = ["project", "vacancy", "news"]
  ) {
    return this.feedService.getFeed(offset, limit, includes).pipe(
      tap(res => {
        this.totalItemsCount.set(res.count);
      }),
      map(res => res.results)
    );
  }
}
