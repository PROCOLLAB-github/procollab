/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Profile } from "../../../../models/profile.model";

/**
 * Компонент для отображения блока месяцев с прогрессом
 *
 * Отображает список месяцев в виде стилизованных элементов,
 * показывает выполненные месяцы и индикатор "Далее"
 *
 * @component MonthBlockComponent
 * @selector app-month-block
 *
 * @input months - Массив месяцев из профиля пользователя
 * @input hasNext - Флаг отображения индикатора "Далее" (по умолчанию true)
 */
@Component({
  selector: "app-month-block",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./month-block.component.html",
  styleUrl: "./month-block.component.scss",
})
export class MonthBlockComponent {
  @Input({ required: true }) months!: Profile["months"];
  @Input() hasNext = true;
}
