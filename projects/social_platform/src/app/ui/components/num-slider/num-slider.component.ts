/** @format */

import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { Subscription } from "rxjs";

/**
 * Компонент числового слайдера для выбора значения из предопределенного набора чисел.
 * Реализует ControlValueAccessor для интеграции с Angular Forms.
 * Поддерживает перетаскивание мышью и ка��ание для мобильных устройств.
 *
 * Входящие параметры:
 * - appNums: массив доступных чисел для выбора
 * - appValue: текущее выбранное значение
 *
 * События:
 * - appValueChange: изменение выбранного значения
 *
 * Возвращает:
 * - Выбранное число через ControlValueAccessor
 */
@Component({
  selector: "app-num-slider",
  templateUrl: "./num-slider.component.html",
  styleUrl: "./num-slider.component.scss",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumSliderComponent),
      multi: true,
    },
  ],
  standalone: true,
})
export class NumSliderComponent implements OnInit, OnDestroy {
  constructor() {}

  /** Массив доступных чисел */
  @Input()
  set appNums(value: number[]) {
    this.nums = value;
  }

  get appNums(): number[] {
    return this.nums;
  }

  /** Текущее выбранное значение */
  @Input()
  set appValue(value: number | null) {
    this.value = !value || isNaN(value) ? this.nums.sort()[0] : value;

    setTimeout(() => {
      this.setElements();
    });
  }

  get appValue(): number | null {
    return this.value;
  }

  /** Событие изменения значения */
  @Output() appValueChange = new EventEmitter<number>();

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  /** Ссылка на элемент точки слайдера */
  @ViewChild("pointEl") pointEl?: ElementRef<HTMLElement>;

  /** Ссылка на элемент диапазона */
  @ViewChild("rangeEl") rangeEl?: ElementRef<HTMLElement>;

  /** Ссылка на элемент заливки */
  @ViewChild("fillEl") fillEl?: ElementRef<HTMLElement>;

  /** Массив подписок */
  subscriptions$: Subscription[] = [];

  /** Текущее значение */
  value: number | null = null;

  /** Массив доступных чисел */
  nums: number[] = [];

  /** Состояние нажатия мыши */
  mousePressed = false;

  /** Обработчик потери фокуса */
  onBlur(): void {
    this.onTouch();
  }

  // Методы ControlValueAccessor
  onChange: (value: number) => void = () => {};

  registerOnChange(fn: (v: number) => void): void {
    this.onChange = fn;
  }

  onTouch: () => void = () => {};

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  disabled = false;

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  /** Обработчик движения мыши/касания */
  onMove(event: MouseEvent | TouchEvent) {
    if (!this.mousePressed) return;

    const range = event.currentTarget as HTMLElement;
    const { width: totalWidth, x } = range.getBoundingClientRect();
    let xChange: number;
    if (event instanceof MouseEvent) xChange = event.clientX - x;
    else if (event instanceof TouchEvent) xChange = event.touches[0].clientX - x;
    else throw Error("Non existing type");

    if (this.pointEl && xChange > 0 && xChange < totalWidth && this.fillEl) {
      this.pointEl.nativeElement.style.left = `${xChange}px`;
      this.fillEl.nativeElement.style.width = `${xChange}px`;
    }

    if (xChange < 0 && xChange > totalWidth) this.onStopInteraction(event);
  }

  /** Получение индекса шага по координате X */
  private getStepIdxFromX(totalWidth: number, x: number): number {
    const intervalWidth = Number.parseInt((totalWidth / (this.nums.length - 1)).toFixed());

    for (let i = 0; i < this.nums.length; i++) {
      const halfInterval = Number.parseInt((intervalWidth / 2).toFixed());
      const startX = i === 0 ? 0 : i * intervalWidth - halfInterval;
      const endX = i === this.nums.length - 1 ? totalWidth : i * intervalWidth + halfInterval;

      if (startX < x && x < endX) {
        return i;
      }
    }

    return 0;
  }

  /** Начало взаимодействия (нажатие мыши/касание) */
  onStartInteraction() {
    this.mousePressed = true;
  }

  /** Получение координаты кнопки в процентах */
  private getButtonCoordinate(): number {
    return this.value ? (100 / (this.nums.length - 1)) * this.nums.indexOf(this.value) : 0;
  }

  /** Окончание взаимодействия */
  onStopInteraction(event: MouseEvent | TouchEvent) {
    event.stopPropagation();

    this.renderRange();
    this.stopMoving();
  }

  /** Отрисовка положения слайдера */
  private renderRange() {
    if (!this.pointEl || !this.rangeEl || !this.fillEl) return;
    const { width: rangeWidth, x: rangeX } = this.rangeEl.nativeElement.getBoundingClientRect();
    const { x } = this.pointEl.nativeElement.getBoundingClientRect();
    const stepIdx = this.getStepIdxFromX(rangeWidth, x - rangeX);
    this.value = this.nums[stepIdx];

    this.setElements();
  }

  /** Установка позиции элементов слайдера */
  setElements() {
    if (!this.pointEl || !this.fillEl) return;

    this.pointEl.nativeElement.style.left = `${this.getButtonCoordinate()}%`;
    this.fillEl.nativeElement.style.width = `${this.getButtonCoordinate()}%`;
  }

  /** Завершение движения слайдера */
  private stopMoving() {
    this.mousePressed = false;
    this.onChange(this.value ?? 0);
    this.appValueChange.emit(this.value ?? 0);
  }
}
