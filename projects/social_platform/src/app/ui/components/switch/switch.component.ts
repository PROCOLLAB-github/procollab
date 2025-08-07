/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

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
})
export class SwitchComponent implements OnInit {
  /** Состояние переключателя */
  @Input({ required: true }) checked!: boolean;

  /** Событие изменения состояния */
  @Output() checkedChange = new EventEmitter<boolean>();

  ngOnInit(): void {}
}
