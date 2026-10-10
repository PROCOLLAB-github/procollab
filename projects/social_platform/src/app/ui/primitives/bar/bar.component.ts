/** @format */

import { inject as injectReleaseLayout } from "@angular/core";
import { DesktopLayoutService as ReleaseDesktopLayoutService } from "../../../../../../ui/src/lib/services/desktop-layout.service";

import { DesktopLayoutService } from "@uilib";

import { inject, ChangeDetectionStrategy, Component, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { BackComponent, TabsComponent } from "@uilib";

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

interface BarLinks {
  link: string;
  linkText: string;
  isRouterLinkActiveOptions: boolean;
  count?: number;
}

/** Примитив: индикатор-полоса (progress/bar). */
@Component({
  selector: "app-bar",
  imports: [TabsComponent, CommonModule, RouterLink, RouterLinkActive, BackComponent],
  templateUrl: "./bar.component.html",
  styleUrl: "./bar.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarComponent {
  protected readonly releaseDesktop = injectReleaseLayout(ReleaseDesktopLayoutService).desktop;

  protected readonly desktopLayout = inject(DesktopLayoutService).desktop;

  /** Массив навигационных ссылок */
  links = input.required<BarLinks[]>();

  /** Показывать индикатор в виде шарика */
  ballHave = input(false);

  /** Маршрут для кнопки "Назад" */
  backRoute = input<string>();

  /** Показывать кнопку "Назад" */
  backHave = input<boolean>();
}
