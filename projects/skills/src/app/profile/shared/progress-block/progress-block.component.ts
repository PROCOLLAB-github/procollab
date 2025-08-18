/** @format */

import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CircleProgressBarComponent } from "../../../shared/circle-progress-bar/circle-progress-bar.component";
import { ActivatedRoute } from "@angular/router";
import { Skill } from "projects/skills/src/models/profile.model";
import { IconComponent } from "@uilib";

/**
 * Компонент блока прогресса навыков
 *
 * Отображает топ-5 навыков пользователя в виде концентрических кругов
 * с индикаторами прогресса. Поддерживает интерактивность при наведении.
 *
 * @component ProgressBlockComponent
 * @selector app-progress-block
 *
 * @property radius - Радиус кругов прогресса (70px)
 * @property skillsList - Список навыков пользователя
 * @property hoveredIndex - Индекс навыка при наведении (-1 если нет)
 * @property tooltipText - Текст подсказки
 * @property isHintVisible - Флаг отображения подсказки
 */
@Component({
  selector: "app-progress-block",
  standalone: true,
  imports: [CommonModule, CircleProgressBarComponent, IconComponent],
  templateUrl: "./progress-block.component.html",
  styleUrl: "./progress-block.component.scss",
})
export class ProgressBlockComponent implements OnInit {
  route = inject(ActivatedRoute);
  radius = 70;
  skillsList = signal<Skill[]>([]);
  hoveredIndex = -1;

  tooltipText = "В блоке «Прогресс» отображаются ваши топ-5 навыков, которые вы проходите";
  isHintVisible = false;

  /**
   * Показывает подсказку
   */
  showTooltip() {
    this.isHintVisible = true;
  }

  /**
   * Скрывает подсказку
   */
  hideTooltip() {
    this.isHintVisible = false;
  }

  /**
   * Вычисляет смещение обводки для индикатора прогресса
   * @param skillProgress - Прогресс навыка в процентах (0-100)
   * @returns Значение stroke-dashoffset для SVG
   */
  calculateStrokeDashOffset(skillProgress: number): number {
    const circumference = 2 * Math.PI * this.radius;
    return circumference - (skillProgress / 100) * circumference;
  }

  /**
   * Вычисляет массив штрихов для окружности
   * @returns Значение stroke-dasharray для SVG
   */
  calculateStrokeDashArray(): number {
    return 2 * Math.PI * this.radius;
  }

  ngOnInit(): void {
    this.route.data.subscribe(r => {
      this.skillsList.set(
        r["data"].skills.sort((a: any, b: any) => b.skillProgress - a.skillProgress)
      );
    });
  }

  /**
   * Вычисляет прозрачность элемента при наведении
   * @param index - Индекс элемента
   * @returns Значение прозрачности (0.3 или 1)
   */
  getOpacity(index: number) {
    if (this.hoveredIndex === -1) {
      return 1;
    }
    return this.hoveredIndex === index ? 1 : 0.3;
  }
}
