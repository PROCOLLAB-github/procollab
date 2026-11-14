/** @format */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  input,
  type OnInit,
  inject,
  effect,
} from "@angular/core";
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { IconComponent } from "../../primitives/icon/icon.component";
import { CommonModule } from "@angular/common";
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
  children?: { name: string; link: string; icon?: string; iconViewBox?: string }[];
}

/**
 * Компонент боковой панели навигации
 *
 * Отображает логотип, список навигационных элементов и дополнительный контент.
 * Поддерживает вложенные пункты навигации.
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
  imports: [RouterLink, RouterLinkActive, IconComponent, ClickOutsideModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
  expandedItem: string | null = null;

  constructor() {
    effect(() => {
      this.navItems();
      this.expandForUrl(this.router.url);
    });
    this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.expandForUrl(event.urlAfterRedirects);
        this.changeDetector.markForCheck();
      }
    });
  }
  /** Массив элементов навигации */
  readonly navItems = input<NavItem[]>([]);

  /** Путь к изображению логотипа (обязательный параметр) */
  readonly logoSrc = input.required<string>();

  ngOnInit(): void {
    this.checkExternalActiveState();
    this.expandForUrl(this.router.url);
  }

  private expandForUrl(url: string): void {
    const path = url.split(/[?#]/)[0];
    const item = this.navItems().find(entry =>
      entry.children?.some(child => path.endsWith("/" + child.link.replace(/^\//, ""))),
    );
    if (item) this.expandedItem = item.link;
  }

  checkExternalActiveState(): void {
    const currentUrl = window.location.href;

    this.navItems().forEach(item => {
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
      this.navItems().forEach(navItem => {
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
}
