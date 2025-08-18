/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { CircleProgressBarComponent } from "../../../shared/circle-progress-bar/circle-progress-bar.component";
import { Skill } from "projects/skills/src/models/profile.model";
import { PluralizePipe } from "@corelib";

/**
 * Компонент карточки навыка с отображением рейтинга и прогресса
 *
 * Показывает информацию о навыке пользователя:
 * - Название и изображение навыка
 * - Текущий уровень навыка
 * - Круговой индикатор прогресса
 *
 * @component PersonalRatingCardComponent
 * @selector app-personal-rating-card
 *
 * @input personalRatingCardData - Данные навыка с прогрессом для отображения
 */
@Component({
  selector: "app-personal-rating-card",
  standalone: true,
  imports: [CommonModule, CircleProgressBarComponent, PluralizePipe, NgOptimizedImage],
  templateUrl: "./personal-rating-card.component.html",
  styleUrl: "./personal-rating-card.component.scss",
})
export class PersonalRatingCardComponent {
  @Input() personalRatingCardData!: Skill;
}
