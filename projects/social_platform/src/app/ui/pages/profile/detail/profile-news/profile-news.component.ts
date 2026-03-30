/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { map } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { NewsCardComponent } from "@ui/widgets/news-card/news-card.component";
import { FeedNews } from "@domain/project/project-news.model";
import { LoggerService } from "@core/lib/services/logger/logger.service";

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileNewsComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly loggerService = inject(LoggerService);

  /** ID пользователя, извлеченный из родительского маршрута профиля */
  userId = this.route.parent?.parent?.snapshot.params["id"];

  /** Сигнал с данными отображаемой новости */
  newsItem = signal<FeedNews | null>(null);

  /**
   * Инициализация компонента
   * Загружает данные новости из резолвера маршрута и устанавливает их в сигнал
   */
  ngOnInit(): void {
    this.route.data
      .pipe(
        map(r => r["data"]),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (r: FeedNews) => {
          this.newsItem.set(r);
        },
        error: err => {
          this.loggerService.info(err);
        },
      });

    this.loggerService.info("", this.newsItem());
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   * Отписывается от всех активных подписок для предотвращения утечек памяти
   */
  ngOnDestroy(): void {}

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
        .then(() => this.loggerService.debug("Route changed from ProfileNewsComponent"));
    }
  }
}
