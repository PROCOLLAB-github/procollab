/** @format */

import { ChangeDetectionStrategy, Component, input, model } from "@angular/core";
import { IconComponent } from "../icon/icon.component";

/**
 * Компонент чекбокса для выбора булевых значений.
 * Отображает состояние отмечен/не отмечен с иконкой галочки.
 *
 * Входящие параметры:
 * - checked: состояние чекбокса (отмечен/не отмечен)
 *
 * События:
 * - checkedChange: изменение состояния чекбокса
 *
 * Возвращает:
 * - boolean значение через событие checkedChange
 */
@Component({
  selector: "app-checkbox",
  templateUrl: "./checkbox.component.html",
  styleUrl: "./checkbox.component.scss",
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent {
  /** Состояние чекбокса */
  checked = model(false);

  size = input<string>();
}
