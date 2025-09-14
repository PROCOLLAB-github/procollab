/** @format */

import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  QueryList,
  ViewChildren,
  type OnInit,
} from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import {
  IconComponent,
  InviteManageCardComponent,
  ProfileControlPanelComponent,
  ProfileInfoComponent,
} from "@uilib";
import { AsyncPipe, CommonModule } from "@angular/common";
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
  /** Флаг для внешних ссылок */
  isExternal?: boolean;
  /** Флаг активности для внешних ссылок */
  isActive?: boolean;
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
  imports: [RouterLink, RouterLinkActive, IconComponent, ClickOutsideModule, CommonModule],
})
export class SidebarComponent implements OnInit, AfterViewInit {
  /** Массив элементов навигации */
  @Input() navItems: NavItem[] = [];

  /** Путь к изображению логотипа (обязательный параметр) */
  @Input({ required: true }) logoSrc!: string;

  ngOnInit(): void {
    this.checkExternalActiveState();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeBarPosition();
    });
  }

  @ViewChildren("navItem") navItemElements!: QueryList<ElementRef<HTMLElement>>;

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

  initializeBarPosition(): void {
    if (!this.navItemElements) return;

    const navElements = this.navItemElements.toArray();

    const activeRouterElement = navElements.find(elementRef =>
      elementRef.nativeElement.classList.contains("sidebar-nav__item--active")
    );

    const activeExternalIndex = this.navItems.findIndex(item => item.isExternal && item.isActive);

    if (activeRouterElement) {
      this.barPosition = activeRouterElement.nativeElement.offsetTop;
    } else if (activeExternalIndex !== -1 && navElements[activeExternalIndex]) {
      this.barPosition = navElements[activeExternalIndex].nativeElement.offsetTop;
    } else {
      this.barPosition = navElements[0]?.nativeElement.offsetTop || 0;
    }
  }

  checkExternalActiveState(): void {
    const currentUrl = window.location.href;

    this.navItems.forEach(item => {
      if (item.isExternal) {
        if (item.link === "skills" && currentUrl.includes("skills.procollab.ru")) {
          item.isActive = true;
        } else if (currentUrl.includes(item.link) && item.link !== "skills") {
          item.isActive = true;
        } else {
          item.isActive = false;
        }
      }
    });
  }

  /**
   * Обрабатывает клик по элементу навигации
   * @param item - элемент навигации
   */
  handleItemClick(item: NavItem): void {
    if (item.isExternal) {
      this.navItems.forEach(navItem => {
        if (navItem.isExternal) {
          navItem.isActive = false;
        }
      });
      item.isActive = true;

      if (item.link === "skills") {
        location.href = "https://skills.procollab.ru";
      } else {
        location.href = item.link;
      }
    }
  }

  /**
   * Обновляет позицию анимированной полосы на основе позиции элемента
   * @param element - HTML элемент навигации
   */
  updateBarPosition(element: HTMLElement): void {
    const parentElement = element.parentElement;
    if (parentElement) {
      this.barPosition = element.offsetTop + 5;
    }
  }
}
