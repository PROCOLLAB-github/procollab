/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarComponent } from "@uilib";
import type { GeneralRating } from "../../../../models/rating.model";

/**
 * Компонент карточки топ-рейтинга
 *
 * Описание: Отображает карточку участника с высоким рейтингом (топ-3)
 * Использование: Для показа лидеров рейтинга с особым оформлением
 *
 * Входные параметры:
 * @param place - позиция в рейтинге (по умолчанию 3)
 * @param rating - объект с данными рейтинга участника (обязательный)
 *
 * Зависимости:
 * - AvatarComponent - для отображения аватара участника
 * - GeneralRating - модель данных рейтинга
 */
@Component({
  selector: "app-top-rating-card",
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  templateUrl: "./top-rating-card.component.html",
  styleUrl: "./top-rating-card.component.scss",
})
export class TopRatingCardComponent {
  /**
   * Позиция участника в рейтинге
   * По умолчанию: 3 место
   */
  @Input() place = 3;

  /**
   * Данные рейтинга участника
   * Обязательное поле, содержит информацию об участнике и его показателях
   */
  @Input({ required: true }) rating!: GeneralRating;
}
