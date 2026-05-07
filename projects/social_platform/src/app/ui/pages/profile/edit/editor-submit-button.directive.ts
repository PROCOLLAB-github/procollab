/** @format */

import { AfterViewInit, Directive, Input, OnDestroy, ViewContainerRef } from "@angular/core";
import { fromEvent, Subscription } from "rxjs";
import { containerSm } from "@utils/responsive";

/**
 * Директива для управления позиционированием кнопки сохранения в редакторе
 * при скролле страницы. Кнопка остается видимой, следуя за скроллом контейнера.
 *
 * Принимает:
 * - containerSelector: селектор контейнера для отслеживания позиции (по умолчанию "profile")
 *
 * Использование: добавить атрибут [appEditorSubmitButton] к элементу кнопки
 */
@Directive({
  selector: "[appEditorSubmitButton]",
  standalone: true,
})
export class EditorSubmitButtonDirective implements AfterViewInit, OnDestroy {
  constructor(private readonly viewRef: ViewContainerRef) {}

  /** Селектор контейнера для отслеживания позиции */
  @Input() containerSelector = "profile";

  /** Инициализация отслеживания скролла после загрузки представления */
  ngAfterViewInit(): void {
    if (window.innerWidth > containerSm)
      setTimeout(() => {
        this.initSaveButtonScroller();
      }, 0);
  }

  /** Очистка подписки при уничтожении компонента */
  ngOnDestroy(): void {
    this.scrollSubscription$?.unsubscribe();
  }

  scrollSubscription$?: Subscription;

  /** Инициализация отслеживания скролла и позиционирования кнопки */
  initSaveButtonScroller(): void {
    const scroller = document.querySelector(".office__body");
    const container = document.querySelector(this.containerSelector);
    const topBar = document.querySelector(".office__top");
    if (!scroller || !container || !topBar) return;

    this.scrollSubscription$ = fromEvent(scroller, "scroll").subscribe(() => {
      const { top: containerTop } = container.getBoundingClientRect();
      const actualScroll = containerTop - topBar.clientHeight;

      if (actualScroll < 0) {
        this.viewRef.element.nativeElement.style.top = `${Math.abs(actualScroll) + 24}px`;
      }
    });
  }
}
