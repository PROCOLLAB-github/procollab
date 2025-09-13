/** @format */

import { Component, Input, type OnInit } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import {
  IconComponent,
  InviteManageCardComponent,
  ProfileControlPanelComponent,
  ProfileInfoComponent,
} from "@uilib";
import { AsyncPipe } from "@angular/common";
import { ClickOutsideModule } from "ng-click-outside";

/**
 * Интерфейс для элемента навигации в боковой панели
 */
export interface NavItem {
  /** Ссылка для роутинга Angular */
  link: string;
  /** Название иконки из спрайта */
  icon: string;
  /** Отображаемое название пункта меню */
  name: string;
}

/**
 * Компонент боковой панели навигации
 *
 * Отображает логотип, список навигационных элементов и дополнительный контент.
 * Поддерживает анимированную полосу при наведении на элементы навигации.
 *
 * @example
 * \`\`\`html
 * <ui-sidebar
 *   [navItems]="navigationItems"
 *   [logoSrc]="logoUrl">
 * </ui-sidebar>
 * \`\`\`
 */
@Component({
  selector: "ui-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrl: "./sidebar.component.scss",
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent, ClickOutsideModule],
})
export class SidebarComponent implements OnInit {
  /** Массив элементов навигации */
  @Input() navItems: NavItem[] = [];

  /** Путь к изображению логотипа (обязательный параметр) */
  @Input({ required: true }) logoSrc!: string;

  ngOnInit(): void {}

  /** Позиция анимированной полосы (индекс элемента навигации) */
  barPosition = 0;

  /** Флаг отображения анимированной полосы */
  showBar = true;

  /**
   * Перенаправляет пользователя на главную страницу приложения
   * Используется при клике на логотип
   */
  redirectToHome(): void {
    window.location.href = "https://app.procollab.ru/office/feed";
  }
}
