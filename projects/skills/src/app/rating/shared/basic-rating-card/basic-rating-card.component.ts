/** @format */

import { Component, inject, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarComponent } from "@uilib";
import { GeneralRating } from "../../../../models/rating.model";
import { PluralizePipe } from "@corelib";
import { ActivatedRoute } from "@angular/router";
import { map, Observable } from "rxjs";

/**
 * Компонент базовой карточки рейтинга
 *
 * Описание: Отображает стандартную карточку участника рейтинга
 * Использование: Для показа участников рейтинга вне топ-3
 *
 * Входные параметры:
 * @param rating - объект с данными рейтинга участника (обязательный)
 * @param ratingId - идентификатор рейтинга
 *
 * Функциональность:
 * - Получает данные рейтинга из маршрута через резолвер
 * - Отображает информацию об участнике с аватаром
 * - Использует pipe для плюрализации текста
 *
 * Зависимости:
 * - AvatarComponent - для отображения аватара участника
 * - PluralizePipe - для корректного склонения слов
 * - GeneralRating - модель данных рейтинга
 */
@Component({
  selector: "app-basic-rating-card",
  standalone: true,
  imports: [CommonModule, AvatarComponent, PluralizePipe],
  templateUrl: "./basic-rating-card.component.html",
  styleUrl: "./basic-rating-card.component.scss",
})
export class BasicRatingCardComponent {
  /**
   * Данные рейтинга участника
   * Обязательное поле, содержит информацию об участнике и его показателях
   */
  @Input({ required: true }) rating!: GeneralRating;

  /**
   * Идентификатор рейтинга
   * Используется для идентификации конкретного рейтинга
   */
  @Input() ratingId!: number;

  /**
   * Сервис для работы с активным маршрутом
   * Инжектируется для получения данных из резолвера
   */
  route = inject(ActivatedRoute);

  /**
   * Observable с данными рейтинга
   * Получает данные из резолвера маршрута и преобразует их в Observable<GeneralRating[]>
   * Возвращает: поток данных с массивом рейтингов
   */
  ratingData = this.route.data.pipe(map(r => r["data"])) as Observable<GeneralRating[]>;
}
