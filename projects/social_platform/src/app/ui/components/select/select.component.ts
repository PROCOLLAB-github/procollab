/** @format */

import {
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IconComponent } from "@ui/components";
import { ClickOutsideModule } from "ng-click-outside";

/**
 * Компонент выпадающего списка для выбора значения из предустановленных опций.
 * Реализует ControlValueAccessor для интеграции с Angular Forms.
 * Поддерживает навигацию с клавиатуры и автоматический скролл к выделенному элементу.
 *
 * Входящие параметры:
 * - placeholder: текст подсказки при отсутствии выбора
 * - selectedId: ID выбранной опции
 * - options: массив опций для выбора с полями value, label, id
 *
 * Возвращает:
 * - Значение выбранной опции через ControlValueAccessor
 *
 * Функциональность:
 * - Навигация стрелками вверх/вниз
 * - Выбор по Enter, закрытие по Escape
 * - Автоматический скролл к выделенному элементу
 * - Закрытие при клике вне компонента
 */
@Component({
  selector: "app-select",
  templateUrl: "./select.component.html",
  styleUrl: "./select.component.scss",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
  standalone: true,
  imports: [ClickOutsideModule, IconComponent],
})
export class SelectComponent implements ControlValueAccessor {
  /** Текст подсказки */
  @Input() placeholder = "";

  /** ID выбранной опции */
  @Input() selectedId?: number;

  @Input() size: "small" | "big" = "small";

  /** Массив доступных опций */
  @Input({ required: true }) options: {
    value: string | number;
    label: string;
    id: number;
  }[] = [];

  /** Состояние открытия выпадающего списка */
  isOpen = false;

  /** Индекс подсвеченного элемента при навигации */
  highlightedIndex = -1;

  constructor(private readonly renderer: Renderer2) {}

  /** Ссылка на элемент выпадающего списка */
  @ViewChild("dropdown") dropdown!: ElementRef<HTMLUListElement>;

  /** Обработчик клавиатурных событий для навигации */
  @HostListener("document:keydown", ["$event"])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen || this.disabled) {
      return;
    }

    event.preventDefault();

    const i = this.highlightedIndex;

    if (event.code === "ArrowUp") {
      if (i < 0) this.highlightedIndex = 0;
      if (i > 0) this.highlightedIndex--;
    }
    if (event.code === "ArrowDown") {
      if (i < this.options.length - 1) {
        this.highlightedIndex++;
      }
    }
    if (event.code === "Enter") {
      if (i >= 0) {
        this.onUpdate(event, this.options[this.highlightedIndex].id);
      }
    }
    if (event.code === "Escape") {
      this.hideDropdown();
    }

    if (this.isOpen) {
      setTimeout(() => this.trackHighlightScroll());
    }
  }

  /** Автоматический скролл к выделенному элементу */
  trackHighlightScroll(): void {
    const ddElem = this.dropdown.nativeElement;

    const highlightedElem = ddElem.children[this.highlightedIndex];

    const ddBox = ddElem.getBoundingClientRect();
    const optBox = highlightedElem.getBoundingClientRect();

    if (optBox.bottom > ddBox.bottom) {
      const scrollAmount = optBox.bottom - ddBox.bottom + ddElem.scrollTop;
      this.renderer.setProperty(ddElem, "scrollTop", scrollAmount);
    } else if (optBox.top < ddBox.top) {
      const scrollAmount = optBox.top - ddBox.top + ddElem.scrollTop;
      this.renderer.setProperty(ddElem, "scrollTop", scrollAmount);
    }
  }

  // Методы ControlValueAccessor
  writeValue(value: number | string) {
    if (typeof value === "string") {
      // Найти ID по значению или label
      this.selectedId = this.getIdByValue(value) || this.getId(value);
    } else {
      this.selectedId = value;
    }
  }

  getIdByValue(value: string | number): number | undefined {
    return this.options.find(el => el.value === value)?.id;
  }

  disabled = false;

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  onChange: (value: string | number) => void = () => {};

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  onTouched: () => void = () => {};

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  /** Обработчик выбора опции */
  onUpdate(event: Event, id: number): void {
    event.stopPropagation();
    if (this.disabled) {
      return;
    }

    this.selectedId = id;
    this.onChange(this.getValue(id) ?? this.options[0].value);

    this.hideDropdown();
  }

  /** Получение текста метки по ID опции */
  getLabel(optionId: number): string | undefined {
    return this.options.find(el => el.id === optionId)?.label;
  }

  /** Получение значения по ID опции */
  getValue(optionId: number): string | number | null | undefined {
    return this.options.find(el => el.id === optionId)?.value;
  }

  /** Получение ID по тексту метки */
  getId(label: string): number | undefined {
    return this.options.find(el => el.label === label)?.id;
  }

  /** Скрытие выпадающего списка */
  hideDropdown() {
    this.isOpen = false;
    this.highlightedIndex = -1;
  }

  /** Обработчик клика вне компонента */
  onClickOutside() {
    this.hideDropdown();
  }
}
