/** @format */

import { ChangeDetectionStrategy, Component, input } from "@angular/core";

/**
 * Компонент индикатора загрузки с настраиваемым внешним видом.
 * Поддерживает различные типы анимации и настройки цвета, размера, скорости.
 *
 * Входящие параметры:
 * - speed: скорость анимации (по умолчанию "1s")
 * - size: размер индикатора (по умолчанию "47px")
 * - color: цвет индикатора (по умолчанию "white")
 * - type: тип анимации ("wave" | "circle", по умолчанию "wave")
 *
 * Использование:
 * - Для показа состояния загрузки в кнопках, формах и других элементах
 * - Настраиваемый размер и цвет под дизайн приложения
 */
@Component({
  selector: "app-loader",
  templateUrl: "./loader.component.html",
  styleUrl: "./loader.component.scss",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {
  /** Скорость анимации */
  speed = input("1s");

  /** Размер индикатора */
  size = input("15px");

  /** Цвет индикатора */
  color = input("white");

  /** Тип анимации */
  type = input<"wave" | "circle">("circle");
}
