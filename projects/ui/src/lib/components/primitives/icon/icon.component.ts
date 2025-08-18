/** @format */

import { Component, Input, type OnInit } from "@angular/core";

/**
 * Компонент для отображения SVG иконок из спрайта
 *
 * Поддерживает различные способы задания размеров:
 * - appSquare: для квадратных иконок (устанавливает одинаковую ширину и высоту)
 * - appWidth/appHeight: для задания конкретных размеров
 * - appViewBox: для настройки области просмотра SVG
 *
 * Иконки загружаются из файла спрайта: assets/icons/symbol/svg/sprite.css.svg
 *
 * @example
 * \`\`\`html
 * <!-- Квадратная иконка 24x24 -->
 * <i appIcon icon="user" appSquare="24"></i>
 *
 * <!-- Иконка с конкретными размерами -->
 * <i appIcon icon="arrow" appWidth="20" appHeight="16"></i>
 *
 * <!-- Иконка с кастомным viewBox -->
 * <i appIcon icon="logo" appViewBox="0 0 100 50"></i>
 * \`\`\`
 */
@Component({
  selector: "[appIcon]",
  templateUrl: "./icon.component.html",
  styleUrl: "./icon.component.scss",
  standalone: true,
})
export class IconComponent implements OnInit {
  /**
   * Устанавливает размер квадратной иконки
   * Автоматически создает viewBox если он не задан
   */
  @Input()
  set appSquare(square: string) {
    this.square = square;
    // Автоматически создаем viewBox для квадратной иконки
    !this.viewBox && (this.viewBox = `0 0 ${square} ${square}`);
  }

  get appSquare(): string {
    return this.square ?? "";
  }

  /**
   * Устанавливает область просмотра SVG (viewBox)
   */
  @Input()
  set appViewBox(viewBox: string) {
    this.viewBox = viewBox;
  }

  get appViewBox(): string {
    return this.viewBox ?? "0 0 0 0";
  }

  /**
   * Устанавливает ширину иконки
   * Обновляет viewBox если он существует
   */
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

  /**
   * Устанавливает высоту иконки
   * Обновляет viewBox если он существует
   */
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

  /** Название иконки из спрайта (обязательный параметр) */
  @Input({ required: true }) icon!: string;

  /** Внутреннее хранение размера квадратной иконки */
  square?: string;

  /** Внутреннее хранение области просмотра */
  viewBox?: string;

  /** Внутреннее хранение ширины */
  width?: string;

  /** Внутреннее хранение высоты */
  height?: string;

  ngOnInit(): void {}

  /**
   * Парсит строку viewBox и возвращает массив значений
   * @param viewBox - строка viewBox в формате "x y width height"
   * @returns массив строк с координатами и размерами
   */
  viewBoxInfo(viewBox: string): string[] {
    return viewBox.split(" ");
  }
}
