/** @format */

import { ChangeDetectionStrategy, Component, input } from "@angular/core";

/**
 * Компонент для отображения аватара пользователя.
 * Поддерживает различные размеры, индикатор онлайн статуса и прогресс-бар.
 *
 * Входящие параметры:
 * - url: URL изображения аватара (обязательный)
 * - size: размер аватара в пикселях (по умолчанию 50)
 * - hasBorder: отображать рамку вокруг аватара
 * - isOnline: показывать индикатор онлайн статуса
 * - progress: значение прогресса для отображения кольца прогресса
 * - onlineBadgeSize: размер индикатора онлайн статуса (по умолчанию 16)
 * - onlineBadgeBorder: толщина рамки индикатора (по умолчанию 3)
 * - onlineBadgeOffset: смещение индикатора от края (по умолчанию 0)
 *
 * Функциональность:
 * - Автоматическая подстановка placeholder при отсутствии изображения
 * - Индикатор онлайн статуса в правом нижнем углу
 * - Кольцо прогресса вокруг аватара
 */
@Component({
  selector: "app-avatar",
  templateUrl: "./avatar.component.html",
  styleUrl: "./avatar.component.scss",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  /** URL изображения аватара */
  url = input.required<string>();

  /** Размер аватара в пикселях */
  size = input(50);

  /** Отображать рамку */
  hasBorder = input(false);

  borderColor = input<"dark-grey" | "white" | "black" | "accent">("white");

  /** Показывать индикатор онлайн статуса */
  isOnline = input(false);

  /** Значение прогресса (0-100) */
  progress = input<number>();

  /** Размер индикатора онлайн статуса */
  onlineBadgeSize = input(16);

  /** Толщина рамки индикатора */
  onlineBadgeBorder = input(3);

  /** Смещение индикатора от края */
  onlineBadgeOffset = input(0);

  /** URL placeholder изображения по умолчанию */
  placeholderUrl = "https://hwchamber.co.uk/wp-content/uploads/2022/04/avatar-placeholder.gif";
}
