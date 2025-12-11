/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { map, Observable } from "rxjs";
import { AsyncPipe } from "@angular/common";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { NewsCardComponent } from "@ui/components/news-card/news-card.component";
import { FeedNews } from "../../../domain/project/project-news.model";

/**
 * КОМПОНЕНТ ДЕТАЛЬНОЙ НОВОСТИ
 *
 * Этот компонент отображает детальную информацию о новости в модальном окне.
 * Используется для просмотра полной версии новости из ленты проекта.
 *
 * НАЗНАЧЕНИЕ:
 * - Отображение детальной информации о новости
 * - Управление модальным окном
 * - Навигация обратно к списку новостей при закрытии
 *
 * @params
 * - Получает данные новости через резолвер из маршрута
 * - Использует параметры newsId и projectId из URL
 *
 * ОСНОВНАЯ ФУНКЦИОНАЛЬНОСТЬ:
 * - Отображение новости в модальном окне
 * - Автоматическое открытие модального окна при загрузке
 * - Навигация к родительскому маршруту при закрытии модального окна
 *
 * @returns
 * - Отображает HTML-шаблон с модальным окном и карточкой новости
 * - Обрабатывает закрытие модального окна через навигацию
 */
@Component({
  selector: "app-news-detail",
  templateUrl: "./news-detail.component.html",
  styleUrl: "./news-detail.component.scss",
  standalone: true,
  imports: [ModalComponent, AsyncPipe, NewsCardComponent],
})
export class NewsDetailComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute, // Сервис для работы с активным маршрутом
    private readonly router: Router // Сервис для навигации
  ) {}

  // Observable с данными новости из резолвера
  newsItem: Observable<FeedNews> = this.route.data.pipe(map(r => r["data"]));

  ngOnInit(): void {}

  /**
   * Обработчик изменения состояния модального окна
   * При закрытии модального окна (value = false) происходит навигация к родительскому маршруту
   * @param value - новое состояние модального окна (открыто/закрыто)
   */
  onOpenChange(value: boolean) {
    if (!value) {
      // Получаем ID проекта из родительского маршрута
      const projectId = this.route.parent?.snapshot.params["projectId"];
      // Навигируем обратно к странице проекта
      this.router
        .navigateByUrl(`/office/projects/${projectId}`)
        .then(() => console.debug("Route changed from NewsDetailComponent"));
    }
  }
}
