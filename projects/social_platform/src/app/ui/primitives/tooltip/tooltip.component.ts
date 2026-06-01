/** @format */

import { CommonModule } from "@angular/common";
import { Component, input, output, ChangeDetectionStrategy } from "@angular/core";
import { IconComponent } from "../icon/icon.component";

/**
 * Переиспользуемый компонент подсказки с иконкой
 *
 * Входящие параметры:
 * - text: текст подсказки
 * - isVisible: состояние видимости подсказки
 * - position: позиция подсказки относительно иконки
 * - iconSize: размер иконки подсказки
 * - tooltipWidth: ширина блока подсказки
 * - customClass: дополнительные CSS классы
 *
 * События:
 * - show: показать подсказку
 * - hide: скрыть подсказку
 */
@Component({
  selector: "app-tooltip",
  templateUrl: "./tooltip.component.html",
  styleUrl: "./tooltip.component.scss",
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent {
  /** Текст подсказки */
  text = input("");

  /** Состояние видимости */
  isVisible = input(false);

  /** Позиция подсказки */
  position = input<"left" | "right">("right");

  /** Размер иконки */
  iconSize = input("16");

  /** Ширина подсказки */
  tooltipWidth = input(250);

  /** Дополнительные CSS классы */
  customClass = input("");

  /** Цвет иконки */
  color = input<"accent" | "grey">("accent");

  /** Событие показа подсказки */
  show = output<void>();

  /** Событие скрытия подсказки */
  hide = output<void>();
}
