/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ProfileNewsService } from "../../../api/profile/profile-news.service";
import { map, Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { NewsCardComponent } from "@ui/components/news-card/news-card.component";
import { FeedNews } from "../../../domain/project/project-news.model";

/**
 * Компонент для отображения отдельной новости профиля в модальном окне
 *
 * Этот компонент предназначен для детального просмотра конкретной новости пользователя
 * в модальном окне поверх основной страницы профиля. Обеспечивает удобную навигацию
 * между новостями без полной перезагрузки страницы.
 *
 * Основные возможности:
 * - Отображение новости в полноэкранном модальном окне
 * - Получение данных новости через резолвер маршрута
 * - Автоматическое закрытие модального окна при навигации
 * - Возврат к основной странице профиля при закрытии
 * - Адаптивное отображение для мобильных и десктопных устройств
 *
 * Жизненный цикл:
 * - При инициализации загружает данные новости из резолвера
 * - Отображает новость в модальном окне
 * - При закрытии возвращает пользователя к профилю
 * - При уничтожении очищает все подписки
 *
 * Навигация:
 * - Получает userId из родительского маршрута профиля
 * - Использует newsId из параметров текущего маршрута
 * - При закрытии перенаправляет на /office/profile/{userId}
 *
 * @implements OnInit - для инициализации и загрузки данных новости
 * @implements OnDestroy - для очистки подписок и предотвращения утечек памяти
 */
@Component({
  selector: "app-profile-news",
  standalone: true,
  imports: [CommonModule, ModalComponent, NewsCardComponent],
  templateUrl: "./profile-news.component.html",
  styleUrl: "./profile-news.component.scss",
})
export class ProfileNewsComponent implements OnInit, OnDestroy {
  private readonly profileService: ProfileNewsService = inject(ProfileNewsService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  /** ID пользователя, извлеченный из родительского маршрута профиля */
  userId = this.route.parent?.parent?.snapshot.params["id"];

  /** Сигнал с данными отображаемой новости */
  newsItem = signal<FeedNews | null>(null);

  /** Массив активных подписок для очистки при уничтожении компонента */
  subscriptions$: Subscription[] = [];

  /**
   * Инициализация компонента
   * Загружает данные новости из резолвера маршрута и устанавливает их в сигнал
   */
  ngOnInit(): void {
    const profileNewsSub$ = this.route.data.pipe(map(r => r["data"])).subscribe({
      next: (r: FeedNews) => {
        this.newsItem.set(r);
      },
      error: err => {
        console.log(err);
      },
    });

    console.log(this.newsItem());

    this.subscriptions$.push(profileNewsSub$);
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   * Отписывается от всех активных подписок для предотвращения утечек памяти
   */
  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  /**
   * Обработчик изменения состояния модального окна
   * При закрытии модального окна (value = false) перенаправляет пользователя
   * обратно к основной странице профиля
   *
   * @param value - новое состояние модального окна (true - открыто, false - закрыто)
   */
  onOpenChange(value: boolean): void {
    if (!value) {
      this.router
        .navigateByUrl(`/office/profile/${this.userId}`)
        .then(() => console.debug("Route changed from ProfileNewsComponent"));
    }
  }
}
