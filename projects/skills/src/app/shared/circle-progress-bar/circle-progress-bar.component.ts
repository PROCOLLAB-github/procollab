/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

/**
 * Компонент круглого прогресс-бара
 *
 * Отображает прогресс в виде круглой диаграммы с использованием SVG.
 * Прогресс отображается как заполненная дуга от 0 до 100%.
 *
 * @example
 * <app-circle-progress-bar [progress]="75"></app-circle-progress-bar>
 */
@Component({
  selector: "app-circle-progress-bar",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./circle-progress-bar.component.html",
  styleUrl: "./circle-progress-bar.component.scss",
})
export class CircleProgressBarComponent {
  /**
   * Значение прогресса в процентах
   * Принимает значения от 0 до 100
   * @default 0
   */
  @Input() progress = 0;

  /**
   * Радиус круга прогресс-бара в пикселях
   * Используется для расчета окружности и отступов
   * @default 70
   */
  radius = 70;

  /**
   * Вычисляет смещение штриха для отображения прогресса
   *
   * Рассчитывает значение stroke-dashoffset для SVG элемента,
   * которое определяет какая часть окружности будет заполнена.
   *
   * @returns {number} Значение смещения штриха в пикселях
   */
  calculateStrokeDashOffset(): number {
    const circumference = 2 * Math.PI * this.radius; // Длина окружности: 2 * π * радиус
    return circumference - (this.progress / 100) * circumference;
  }

  /**
   * Вычисляет массив штрихов для SVG окружности
   *
   * Возвращает полную длину окружности, которая используется
   * в качестве значения stroke-dasharray для создания пунктирной линии.
   *
   * @returns {number} Длина окружности в пикселях
   */
  calculateStrokeDashArray(): number {
    return 2 * Math.PI * this.radius; // Полная длина окружности: 2 * π * радиус
  }
}
