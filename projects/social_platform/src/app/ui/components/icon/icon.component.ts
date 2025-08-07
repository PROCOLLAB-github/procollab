/** @format */

import { Component, Input, OnInit } from "@angular/core";

/**
 * Компонент для отображения SVG иконок с настраиваемыми параметрами.
 * Поддерживает автоматическое вычисление viewBox и размеров.
 *
 * Входящие параметры:
 * - appSquare: размер квадратной иконки (автоматически устанавливает viewBox)
 * - appViewBox: кастомный viewBox для SVG
 * - appWidth: ширина иконки
 * - appHeight: высота иконки
 * - icon: имя иконки для отображения (обязательный)
 *
 * Функциональность:
 * - Автоматическое вычисление viewBox для квадратных иконок
 * - Поддержка кастомных размеров и пропорций
 * - Динамическое обновление viewBox при изменении размеров
 *
 * Использование как атрибутивная директива: <svg appIcon="icon-name">
 */
@Component({
  selector: "[appIcon]",
  templateUrl: "./icon.component.html",
  styleUrl: "./icon.component.scss",
  standalone: true,
})
export class IconComponent implements OnInit {
  /** Размер квадратной иконки */
  @Input()
  set appSquare(square: string) {
    this.square = square;

    !this.viewBox && (this.viewBox = `0 0 ${square} ${square}`);
  }

  get appSquare(): string {
    return this.square ?? "";
  }

  /** Кастомный viewBox */
  @Input()
  set appViewBox(viewBox: string) {
    this.viewBox = viewBox;
  }

  get appViewBox(): string {
    return this.viewBox ?? "0 0 0 0";
  }

  /** Ширина иконки */
  @Input()
  set appWidth(width: string) {
    this.width = width;

    if (this.viewBox) {
      const viewbox = this.viewBoxInfo(this.viewBox);
      viewbox[2] = width;
      !this.viewBox && (this.viewBox = viewbox.join(" "));
    }
  }

  get appWidth(): string {
    return this.width ?? "";
  }

  /** Высота иконки */
  @Input()
  set appHeight(height: string) {
    this.height = height;

    if (this.viewBox) {
      const viewbox = this.viewBoxInfo(this.viewBox);
      viewbox[3] = height;
      !this.viewBox && (this.viewBox = viewbox.join(" "));
    }
  }

  get appHeight(): string {
    return this.height ?? "";
  }

  /** Имя иконки для отображения */
  @Input({ required: true }) icon!: string;

  square?: string;
  viewBox?: string;
  width?: string;
  height?: string;

  ngOnInit(): void {}

  /** Парсинг параметров viewBox */
  viewBoxInfo(viewBox: string): string[] {
    return viewBox.split(" ");
  }
}
