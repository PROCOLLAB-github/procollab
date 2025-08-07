/** @format */

import { Component, EventEmitter, Input, type OnInit, Output } from "@angular/core";
import { IconComponent } from "@ui/components/icon/icon.component";

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
  standalone: true,
  imports: [IconComponent],
})
export class CheckboxComponent implements OnInit {
  /** Состояние чекбокса */
  @Input({ required: true }) checked = false;

  /** Событие изменения состояния */
  @Output() checkedChange = new EventEmitter<boolean>();

  ngOnInit(): void {}
}
