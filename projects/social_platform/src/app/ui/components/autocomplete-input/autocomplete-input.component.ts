/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  signal,
  ViewChild,
} from "@angular/core";
import { IconComponent } from "@uilib";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { ClickOutsideModule } from "ng-click-outside";
import { debounce, distinctUntilChanged, fromEvent, map, of, Subscription, timer } from "rxjs";
import { animate, style, transition, trigger } from "@angular/animations";
import { LoaderComponent } from "@ui/components/loader/loader.component";

/**
 * Компонент автодополнения с поиском и выбором из списка предложений.
 * Реализует ControlValueAccessor для интеграции с Angular Forms.
 * Поддерживает различные режимы отображения и настройки поведения.
 *
 * Входящие параметры:
 * - suggestions: массив предложений для отображения
 * - fieldToDisplayMode: режим отображения ("text" | "chip")
 * - fieldToDisplay: поле объекта для отображения
 * - valueField: поле для получения значения
 * - forceSelect: принудительный выбор из списка
 * - clearInputOnSelect: очистка поля после выбора
 * - delay: задержка поиска в мс (по умолчанию 300)
 * - placeholder: placeholder для поля ввода
 * - searchIcon: иконка поиска
 * - slimVersion: компактная версия
 * - error: состояние ошибки
 *
 * События:
 * - searchStart: начало поиска с текстом запроса
 * - optionSelected: выбор опции из списка
 * - inputCleared: очистка поля ввода
 *
 * Возвращает:
 * - Выбранное значение через ControlValueAccessor
 */
@Component({
  selector: "app-autocomplete-input",
  standalone: true,
  imports: [CommonModule, IconComponent, ClickOutsideModule, LoaderComponent],
  templateUrl: "./autocomplete-input.component.html",
  styleUrl: "./autocomplete-input.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutoCompleteInputComponent),
      multi: true,
    },
  ],
  animations: [
    trigger("dropdownAnimation", [
      transition(":enter", [
        style({ opacity: 0, transform: "scaleY(0.8)" }),
        animate(".12s cubic-bezier(0, 0, 0.2, 1)"),
      ]),
      transition(":leave", [animate(".1s linear", style({ opacity: 0 }))]),
    ]),
  ],
})
export class AutoCompleteInputComponent<T> {
  /** Массив предложений для отображения */
  @Input({ required: true }) get suggestions(): T[] {
    return this._suggestions();
  }

  set suggestions(val: T[]) {
    this._suggestions.set(val);
    this.handleSuggestionsChange(val);
  }

  /** Режим отображения выбранного поля */
  @Input() fieldToDisplayMode: "text" | "chip" = "text";

  /** Поле объекта для отображения */
  @Input() fieldToDisplay!: keyof T;

  /** Поле для получения значения */
  @Input() valueField!: string;

  /** Принудительный выбор из списка */
  @Input() forceSelect = false;

  /** Очистка поля после выбора */
  @Input() clearInputOnSelect = false;

  /** Задержка поиска в мс */
  @Input() delay = 300;

  /** Placeholder для поля ввода */
  @Input() placeholder = "";

  /** Иконка поиска */
  @Input() searchIcon = "search";

  /** Компактная версия */
  @Input() slimVersion = false;

  /** Состояние ошибки */
  @Input() error = false;

  /** Событие начала поиска */
  @Output() searchStart = new EventEmitter<string>();

  /** Событие выбора опции */
  @Output() optionSelected = new EventEmitter();

  /** Событие очистки поля */
  @Output() inputCleared = new EventEmitter();

  /** Ссылка на элемент input */
  @ViewChild("input") inputElem!: ElementRef;

  /** Текущее выбранное значение */
  value = signal(null);

  /** Значение в поле ввода */
  inputValue = signal("");

  /** Массив предложений */
  _suggestions = signal<T[]>([]);

  /** Состояние открытия выпадающего списка */
  isOpen = signal(false);

  /** Состояние загрузки */
  loading = signal(false);

  /** Состояние отсутствия результатов */
  noResults = signal(false);

  /** Состояние блокировки */
  disabled = signal(false);

  /** Массив подписок */
  subscriptions$ = signal<Subscription[]>([]);

  constructor(private readonly cdRef: ChangeDetectorRef) {}

  /** Инициализация отслеживания ввода после загрузки представления */
  ngAfterViewInit(): void {
    const input$ = fromEvent<Event>(this.inputElem.nativeElement, "input")
      .pipe(
        map(e => (e.target as HTMLInputElement).value.trim()),
        debounce(val => (val ? timer(this.delay) : of({}))),
        distinctUntilChanged()
      )
      .subscribe(val => this.handleSearch(val));

    this.subscriptions$().push(input$);
  }

  ngOnInit(): void {}

  /** Обработчик ввода текста */
  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.inputValue.set(value);
  }

  /** Обработчик потери фокуса */
  onBlur(): void {
    this.onTouch();
  }

  // Методы ControlValueAccessor
  writeValue(value: any): void {
    this.value.set(value?.[this.valueField] ?? value);
    this.handleProgrammaticInputValueChange(value);
  }

  onChange: (value: any) => void = () => {};

  registerOnChange(fn: (v: any) => void): void {
    this.onChange = fn;
  }

  onTouch: () => void = () => {};

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  /** Обработчик нажатия Enter */
  onEnter(event: Event): void {
    event.preventDefault();
  }

  /** Обработчик выбора значения из списка */
  onUpdate(event: Event, value: any): void {
    event.stopPropagation();

    const newValue = value?.[this.valueField] ?? value;

    this.value.set(newValue);
    this.onChange(newValue);
    this.optionSelected.emit(newValue);

    this.handleProgrammaticInputValueChange(newValue);

    this.isOpen.set(false);
  }

  /** Обработчик очистки значения */
  onClearValue(event: Event): void {
    event.stopPropagation();
    this.inputValue.set("");
    this.value.set(null);
    this.onChange(null);
  }

  /** Обработчик клика вне компонента */
  onClickOutside(): void {
    const value = this.findExistingSuggestion(this.suggestions);

    if (this.forceSelect && this.isOpen() && value) {
      const newValue = value?.[this.valueField] ?? value;

      this.handleProgrammaticInputValueChange(newValue);
      this.value.set(newValue);
      this.onChange(newValue);
    } else if (this.forceSelect && this.isOpen() && !value) {
      this.inputValue.set("");
      this.value.set(null);
      this.onChange(null);
    }

    this.isOpen.set(false);
  }

  /** Обработчик поиска */
  handleSearch(query: string): void {
    if (!query) {
      this.isOpen.set(false);
      this.cdRef.markForCheck();
      this.inputCleared.emit();
      return;
    }

    this.loading.set(true);
    this.searchStart.emit(query);
  }

  /** Обработчик вставки текста */
  handlePaste(event: ClipboardEvent): void {
    const query = event.clipboardData?.getData("text");

    if (query) {
      this.handleSearch(query.trim());
    }
  }

  /** Обработчик изменения списка предложений */
  handleSuggestionsChange(suggestions: any[]): void {
    if (!suggestions?.length && this.loading()) {
      this.noResults.set(true);
      this.isOpen.set(true);
    }

    if (this.suggestions?.length) {
      this.noResults.set(false);
      this.isOpen.set(true);
    }

    this.loading.set(false);
  }

  /** Обработчик программного изменения значения поля ввода */
  handleProgrammaticInputValueChange(appValue: any): void {
    if (this.fieldToDisplayMode === "chip" || this.clearInputOnSelect) {
      this.inputValue.set("");
    } else {
      this.inputValue.set(appValue?.[this.fieldToDisplay] ?? appValue);
    }
  }

  /** Поиск существующего предложения по введенному тексту */
  findExistingSuggestion(suggestions: typeof this.suggestions): any {
    if (!this.fieldToDisplay) {
      return suggestions.find(s => String(s).toLowerCase() === this.inputValue().toLowerCase());
    }
    return suggestions.find(
      s => String(s[this.fieldToDisplay]).toLowerCase() === this.inputValue().toLocaleLowerCase()
    );
  }

  /** Очистка подписок при уничтожении компонента */
  ngOnDestroy(): void {
    this.subscriptions$().forEach($ => $.unsubscribe());
  }
}
