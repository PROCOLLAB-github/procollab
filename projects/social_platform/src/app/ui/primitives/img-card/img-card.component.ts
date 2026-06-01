/** @format */

import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { IconComponent } from "../icon/icon.component";

/**
 * Компонент карточки изображения с состояниями загрузки и ошибки
 *
 * Функциональность:
 * - Отображает изображение по переданному URL
 * - Показывает состояния загрузки и ошибки
 * - Предоставляет кнопки для отмены и повторной попытки загрузки
 *
 * Входные параметры:
 * input src - URL изображения (по умолчанию пустая строка)
 * input error - флаг состояния ошибки (по умолчанию false)
 * input loading - флаг состояния загрузки (по умолчанию false)
 *
 * Выходные события:
 * output cancel - событие отмены загрузки/отображения изображения
 * output retry - событие повторной попытки загрузки изображения
 */
@Component({
  selector: "app-img-card",
  templateUrl: "./img-card.component.html",
  styleUrl: "./img-card.component.scss",
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImgCardComponent {
  src = input("");
  error = input(false);
  loading = input(false);

  cancel = output<void>();
  retry = output<void>();
}
