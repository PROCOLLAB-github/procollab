/** @format */

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from "@angular/core";
import { DomPortal } from "@angular/cdk/portal";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ClickOutsideModule } from "ng-click-outside";
import { CommonModule } from "@angular/common";

/**
 * Универсальный компонент контекстного меню
 *
 * Особенности:
 * - Автоматическое позиционирование с учетом границ экрана
 * - Гибкая конфигурация пунктов меню
 * - Поддержка условного отображения пунктов
 * - Автоматическое закрытие при клике вне меню
 *
 * @example
 * ```html
 * <app-context-menu
 *   [items]="menuItems"
 *   (itemClick)="onMenuItemClick($event)"
 * ></app-context-menu>
 * ```
 */
@Component({
  selector: "app-context-menu",
  templateUrl: "./context-menu.component.html",
  styleUrl: "./context-menu.component.scss",
  standalone: true,
  imports: [CommonModule, ClickOutsideModule],
})
export class ContextMenuComponent implements AfterViewInit, OnDestroy {
  constructor(private readonly overlay: Overlay) {}

  /** Список пунктов меню */
  @Input({ required: true }) items: any[] = [];

  /** Дополнительный CSS класс для меню */
  @Input() customClass?: string;

  /** Минимальная ширина меню */
  @Input() minWidth?: number;

  /** Событие клика по пункту меню */
  @Output() itemClick = new EventEmitter<string>();

  /** Событие открытия меню */
  @Output() menuOpen = new EventEmitter<void>();

  /** Событие закрытия меню */
  @Output() menuClose = new EventEmitter<void>();

  /** Ссылка на элемент контекстного меню */
  @ViewChild("contextMenu", { static: false }) contextMenu!: ElementRef<HTMLUListElement>;

  /** Ссылка на overlay */
  private overlayRef?: OverlayRef;

  /** Portal для контекстного меню */
  private portal?: DomPortal;

  /** Состояние открытия контекстного меню */
  isOpen = false;

  /** Инициализация overlay для контекстного меню */
  ngAfterViewInit(): void {
    this.overlayRef = this.overlay.create({
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });
    this.portal = new DomPortal(this.contextMenu);
  }

  /** Очистка ресурсов overlay */
  ngOnDestroy(): void {
    this.overlayRef?.dispose();
  }

  /**
   * Открытие контекстного меню в заданной позиции
   * @param event - событие мыши (для автоматического позиционирования)
   * @param position - пользовательская позиция меню
   */
  open(event?: MouseEvent, position?: { x: number; y: number }): void {
    if (this.isOpen) return;

    this.isOpen = true;
    this.menuOpen.emit();

    // Ждем рендеринга меню для получения его размеров
    setTimeout(() => {
      const menuHeight = this.contextMenu.nativeElement.offsetHeight;
      const menuWidth = this.contextMenu.nativeElement.offsetWidth;

      let positionX: number;
      let positionY: number;

      if (event) {
        // Автоматическое позиционирование относительно курсора
        positionX = event.clientX;
        positionY = event.clientY;

        // Проверка выхода за правую границу экрана
        if (positionX + menuWidth > window.innerWidth) {
          positionX = window.innerWidth - menuWidth - 10;
        }

        // Проверка выхода за нижнюю границу экрана
        if (positionY + menuHeight > window.innerHeight) {
          positionY = event.clientY - menuHeight;
        }
      } else if (position) {
        // Использование пользовательской позиции
        positionX = position.x;
        positionY = position.y;
      } else {
        // Позиция по умолчанию
        positionX = 0;
        positionY = 0;
      }

      const positionStrategy = this.overlay
        .position()
        .global()
        .left(positionX + "px")
        .top(positionY + "px");

      this.overlayRef?.updatePositionStrategy(positionStrategy);

      if (!this.overlayRef?.hasAttached()) {
        this.overlayRef?.attach(this.portal);
      }

      this.contextMenu.nativeElement.focus();
    }, 0);
  }

  /**
   * Закрытие контекстного меню
   */
  close(): void {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.menuClose.emit();
    this.overlayRef?.detach();
  }

  /**
   * Переключение состояния меню
   * @param event - событие мыши
   */
  toggle(event?: MouseEvent): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open(event);
    }
  }

  /**
   * Обработчик клика по пункту меню
   * @param event - событие клика
   * @param itemId - идентификатор пункта меню
   */
  onItemClick(event: MouseEvent, itemId: string): void {
    event.stopPropagation();
    this.itemClick.emit(itemId);
    this.close();
  }

  /**
   * Обработчик клика вне меню
   */
  onClickOutside(): void {
    this.close();
  }

  /**
   * Фильтр видимых пунктов меню
   */
  get visibleItems(): any[] {
    return this.items.filter(item => item.visible !== false);
  }
}
