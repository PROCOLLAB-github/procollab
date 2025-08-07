/** @format */

import { Component, Input, OnInit } from "@angular/core";
import { New } from "@models/article.model";

/**
 * Компонент карточки рекламного объявления
 *
 * Функциональность:
 * - Отображает рекламное объявление в виде карточки
 * - Поддерживает два варианта макета: вертикальный и горизонтальный
 * - Простой компонент для отображения информации без интерактивности
 *
 * Входные параметры:
 * @Input advert - объект рекламного объявления (обязательный)
 * @Input layout - тип макета карточки: "vertical" или "horizontal" (по умолчанию "vertical")
 *
 * Выходные события: отсутствуют
 *
 * Примечание: Компонент предназначен только для отображения, не содержит бизнес-логики
 */
@Component({
  selector: "app-advert-card",
  templateUrl: "./advert-card.component.html",
  styleUrl: "./advert-card.component.scss",
  standalone: true,
  imports: [],
})
export class AdvertCardComponent implements OnInit {
  constructor() {}

  @Input({ required: true }) advert!: New;
  @Input() layout: "vertical" | "horizontal" = "vertical";

  ngOnInit(): void {}
}
