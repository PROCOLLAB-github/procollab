/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { BackComponent } from "@uilib";

/**
 * Компонент навигационной панели с табами и кнопкой "Назад".
 * Отображает горизонтальный список ссылок с индикаторами активности и счетчиками.
 *
 * Входящие параметры:
 * - links: массив объектов навигационных ссылок с настройками
 *   - link: URL ссылки
 *   - linkText: текст ссылки
 *   - isRouterLinkActiveOptions: настройки активности ссылки
 *   - count: количество элементов для отображения бейджа (опционально)
 * - backRoute: маршрут для кнопки "Назад" (опционально)
 * - backHave: показывать ли кнопку "Назад" (опционально)
 * - ballHave: показывать ли индикатор в виде шарика (по умолчанию false)
 *
 * Использование:
 * - Навигация между разделами приложения
 * - Отображение количества элементов в разделах
 * - Навигация назад к предыдущему экрану
 */
@Component({
  selector: "app-bar",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, BackComponent],
  templateUrl: "./bar.component.html",
  styleUrl: "./bar.component.scss",
})
export class BarComponent {
  constructor() {}

  /** Массив навигационных ссылок */
  @Input() links!: {
    link: string;
    linkText: string;
    isRouterLinkActiveOptions: boolean;
    count?: number;
  }[];

  /** Маршрут для кнопки "Назад" */
  @Input() backRoute?: string;

  /** Показывать кнопку "Назад" */
  @Input() backHave?: boolean;

  /** Показывать индикатор в виде шарика */
  @Input() ballHave?: boolean = false;
}
