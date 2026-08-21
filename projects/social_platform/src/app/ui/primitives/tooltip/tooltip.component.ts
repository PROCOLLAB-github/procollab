/** @format */

import {
  ConnectedOverlayPositionChange,
  ConnectedPosition,
  OverlayModule,
} from "@angular/cdk/overlay";
import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, input, output, signal } from "@angular/core";
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
  imports: [CommonModule, IconComponent, OverlayModule],
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

  useOverlay = input(false);

  /** Событие показа подсказки */
  show = output<void>();

  /** Событие скрытия подсказки */
  hide = output<void>();

  overlayPlacement = signal<"left" | "right" | null>(null);

  private readonly rightOverlayPosition: ConnectedPosition = {
    originX: "end",
    originY: "center",
    overlayX: "start",
    overlayY: "center",
    offsetX: 8,
  };

  private readonly leftOverlayPosition: ConnectedPosition = {
    originX: "start",
    originY: "center",
    overlayX: "end",
    overlayY: "center",
    offsetX: -8,
  };

  get overlayPositions(): ConnectedPosition[] {
    return this.position() === "right"
      ? [this.rightOverlayPosition, this.leftOverlayPosition]
      : [this.leftOverlayPosition, this.rightOverlayPosition];
  }

  get currentOverlayPlacement(): "left" | "right" {
    return this.overlayPlacement() ?? this.position();
  }

  onOverlayPositionChange(event: ConnectedOverlayPositionChange): void {
    this.overlayPlacement.set(event.connectionPair.overlayX === "start" ? "right" : "left");
  }
}
