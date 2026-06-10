/** @format */

import { ChangeDetectionStrategy, Component, model } from "@angular/core";

/**
 * Компонент переключателя (switch) для булевых значений.
 * Альтернатива чекбоксу с современным дизайном в виде ползунка.
 *
 * Входящие параметры:
 * - checked: состояние переключателя (включен/выключен)
 *
 * События:
 * - checkedChange: изменение состояния переключателя
 *
 * Возвращает:
 * - boolean значение через событие checkedChange
 *
 * Использование:
 * - Для настроек вкл/выкл
 * - Булевых переключателей в формах
 */
@Component({
  selector: "app-switch",
  templateUrl: "./switch.component.html",
  styleUrl: "./switch.component.scss",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchComponent {
  /** Состояние переключателя */
  checked = model(false);
}
