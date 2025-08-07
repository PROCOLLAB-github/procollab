/** @format */

import { Component, Input, type OnInit } from "@angular/core";

/**
 * Компонент аватара пользователя
 *
 * Отображает круглое изображение профиля с возможностью:
 * - Настройки размера
 * - Добавления рамки
 * - Показа индикатора онлайн статуса
 * - Использования placeholder изображения при отсутствии URL
 *
 * @example
 * \`\`\`html
 * <!-- Базовое использование -->
 * <app-avatar [url]="user.avatar"></app-avatar>
 *
 * <!-- С онлайн статусом и рамкой -->
 * <app-avatar
 *   [url]="user.avatar"
 *   [size]="60"
 *   [isOnline]="user.isOnline"
 *   [hasBorder]="true">
 * </app-avatar>
 * \`\`\`
 */
@Component({
  selector: "app-avatar",
  templateUrl: "./avatar.component.html",
  styleUrl: "./avatar.component.scss",
  standalone: true,
})
export class AvatarComponent implements OnInit {
  /** URL изображения аватара (опциональный, при отсутствии используется placeholder) */
  @Input({ required: true }) url?: string;

  /** Размер аватара в пикселях (по умолчанию 50px) */
  @Input() size = 50;

  /** Флаг отображения рамки вокруг аватара */
  @Input() hasBorder = false;

  /** Флаг отображения индикатора онлайн статуса */
  @Input() isOnline = false;

  /** Размер индикатора онлайн статуса в пикселях */
  @Input() onlineBadgeSize = 16;

  /** Толщина рамки индикатора онлайн статуса в пикселях */
  @Input() onlineBadgeBorder = 3;

  /** Смещение индикатора онлайн статуса от края аватара */
  @Input() onlineBadgeOffset = 0;

  /** URL placeholder изображения, используемого при отсутствии аватара */
  placeholderUrl =
    "https://uch-ibadan.org.ng/wp-content/uploads/2021/10/Profile_avatar_placeholder_large.png";

  constructor() {}

  ngOnInit(): void {}
}
