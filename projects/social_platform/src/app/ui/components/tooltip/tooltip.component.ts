/** @format */

import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter } from "@angular/core";
import { IconComponent } from "@ui/components";

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
  standalone: true,
  imports: [CommonModule, IconComponent],
})
export class TooltipComponent {
  /** Текст подсказки */
  @Input() text = "";

  /** Состояние видимости */
  @Input() isVisible = false;

  /** Позиция подсказки */
  @Input() position: "left" | "right" = "right";

  /** Размер иконки */
  @Input() iconSize = "24";

  /** Ширина подсказки */
  @Input() tooltipWidth = 250;

  /** Дополнительные CSS классы */
  @Input() customClass = "";

  /** Событие показа подсказки */
  @Output() show = new EventEmitter<void>();

  /** Событие скрытия подсказки */
  @Output() hide = new EventEmitter<void>();
}
