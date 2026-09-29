/** @format */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  input,
  Input,
  OnDestroy,
  output,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from "@angular/core";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { CommonModule } from "@angular/common";
import { A11yModule } from "@angular/cdk/a11y";

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
  imports: [CommonModule, A11yModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  constructor(
    private readonly overlay: Overlay,
    private readonly viewContainerRef: ViewContainerRef,
  ) {}

  /** Цветовая схема модального окна */
  color = input<"primary" | "gradient">("primary");

  /** Дополнительный CSS-класс для modal__body */
  bodyClass = input<string>();

  /** Accessible dialog mode. Focus trap must live inside the attached portal. */
  labelledBy = input<string>();
  describedBy = input<string>();
  private openTimer?: ReturnType<typeof setTimeout>;

  /** Состояние открытия модального окна — setter input, нельзя конвертировать в signal */
  @Input({ required: true }) set open(value: boolean) {
    clearTimeout(this.openTimer);
    this.openTimer = setTimeout(() => {
      if (value && !this.overlayRef?.hasAttached()) this.overlayRef?.attach(this.portal);
      else if (!value) this.overlayRef?.detach();
    });
  }

  get open(): boolean {
    return !!this.overlayRef?.hasAttached();
  }

  /** Событие изменения состояния открытия */
  openChange = output<boolean>();

  /** Инициализация overlay после загрузки представления */
  ngAfterViewInit(): void {
    const tpl = this.modalTemplate();
    if (tpl) {
      this.overlayRef = this.overlay.create({
        scrollStrategy: this.labelledBy()
          ? this.overlay.scrollStrategies.block()
          : this.overlay.scrollStrategies.noop(),
      });
      this.portal = new TemplatePortal(tpl, this.viewContainerRef);
    }
  }

  /** Очистка ресурсов при уничтожении */
  ngOnDestroy(): void {
    clearTimeout(this.openTimer);
    this.overlayRef?.dispose();
  }

  onEscape(event: Event): void {
    if (!this.labelledBy()) return;
    event.stopPropagation();
    this.openChange.emit(false);
  }

  /** Ссылка на шаблон модального окна */
  modalTemplate = viewChild<TemplateRef<HTMLElement>>("modalTemplate");

  /** Portal для проекции контента */
  portal?: TemplatePortal;

  /** Ссылка на overlay */
  overlayRef?: OverlayRef;
}
