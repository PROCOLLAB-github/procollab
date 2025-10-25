/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { IconComponent } from "@uilib";

/**
 * Отображает горизонтальный список ссылок с индикаторами активности и счетчиками.
 *
 * Входящие параметры:
 * - links: массив объектов навигационных ссылок с настройками
 *   - link: URL ссылки
 *   - linkText: текст ссылки
 *   - isRouterLinkActiveOptions: настройки активности ссылки)
 *
 * Использование:
 * - Навигация между разделами приложения
 */
@Component({
  selector: "app-bar-new",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: "./bar.component.html",
  styleUrl: "./bar.component.scss",
})
export class BarNewComponent {
  constructor() {}

  /** Массив навигационных ссылок */
  @Input() links!: {
    link: string;
    linkText: string;
    iconName: string;
    isRouterLinkActiveOptions: boolean;
  }[];
}
