/** @format */

import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { CommonModule } from "@angular/common";

/**
 * Универсальный компонент модального окна с overlay.
 * Использует Angular CDK Overlay для создания модальных окон поверх основного контента.
 *
 * Входящие параметры:
 * - color: цветовая схема модального окна ("primary" | "gradient")
 * - open: состояние открытия/закрытия модального окна
 *
 * События:
 * - openChange: изменение состояния открытия модального окна
 *
 * Функциональность:
 * - Создание overlay поверх страницы
 * - Автоматическое управление отображением при изменении open
 * - Проекция контента через ng-content
 * - Очистка ресурсов при уничтожении компонента
 *
 * Использование:
 * - Обертка контента в <app-modal [open]="isOpen">...</app-modal>
 * - Модальные диалоги, формы, галереи изображений
 */
@Component({
  selector: "app-modal",
  templateUrl: "./modal.component.html",
  styleUrl: "./modal.component.scss",
  standalone: true,
  imports: [CommonModule],
})
export class ModalComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private readonly overlay: Overlay,
    private readonly viewContainerRef: ViewContainerRef
  ) {}

  /** Цветовая схема модального окна */
  @Input() color?: "primary" | "gradient" = "primary";

  /** Состояние открытия модального окна */
  @Input({ required: true }) set open(value: boolean) {
    setTimeout(() => {
      if (value) this.overlayRef?.attach(this.portal);
      else this.overlayRef?.detach();
    });
  }

  get open(): boolean {
    return !!this.overlayRef?.hasAttached();
  }

  /** Событие изменения состояния открытия */
  @Output() openChange = new EventEmitter<boolean>();

  ngOnInit(): void {}

  /** Инициализация overlay после загрузки представления */
  ngAfterViewInit(): void {
    if (this.modalTemplate) {
      this.overlayRef = this.overlay.create({});
      this.portal = new TemplatePortal(this.modalTemplate, this.viewContainerRef);
    }
  }

  /** Очистка ресурсов при уничтожении */
  ngOnDestroy(): void {
    this.overlayRef?.detach();
  }

  /** Ссылка на шаблон модального окна */
  @ViewChild("modalTemplate") modalTemplate?: TemplateRef<HTMLElement>;

  /** Portal для проекции контента */
  portal?: TemplatePortal;

  /** Ссылка на overlay */
  overlayRef?: OverlayRef;
}
