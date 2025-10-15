/** @format */

import { Component, Input, type OnInit } from "@angular/core";

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
})
export class AvatarComponent implements OnInit {
  /** URL изображения аватара */
  @Input({ required: true }) url?: string;

  /** Размер аватара в пикселях */
  @Input() size = 50;

  /** Отображать рамку */
  @Input() hasBorder = false;

  @Input() borderColor: "dark-grey" | "white" | "black" | "accent" = "white";

  /** Показывать индикатор онлайн статуса */
  @Input() isOnline = false;

  /** Значение прогресса (0-100) */
  @Input() progress?: number;

  /** Размер индикатора онлайн статуса */
  @Input() onlineBadgeSize = 16;

  /** Толщина рамки индикатора */
  @Input() onlineBadgeBorder = 3;

  /** Смещение индикатора от края */
  @Input() onlineBadgeOffset = 0;

  /** URL placeholder изображения по умолчанию */
  placeholderUrl = "https://hwchamber.co.uk/wp-content/uploads/2022/04/avatar-placeholder.gif";

  constructor() {}

  ngOnInit(): void {}
}
