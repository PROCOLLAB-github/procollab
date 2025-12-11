/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { IconComponent } from "@ui/components";

/**
 * Компонент карточки изображения с состояниями загрузки и ошибки
 *
 * Функциональность:
 * - Отображает изображение по переданному URL
 * - Показывает состояния загрузки и ошибки
 * - Предоставляет кнопки для отмены и повторной попытки загрузки
 *
 * Входные параметры:
 * @Input src - URL изображения (по умолчанию пустая строка)
 * @Input error - флаг состояния ошибки (по умолчанию false)
 * @Input loading - флаг состояния загрузки (по умолчанию false)
 *
 * Выходные события:
 * @Output cancel - событие отмены загрузки/отображения изображения
 * @Output retry - событие повторной попытки загрузки изображения
 */
@Component({
  selector: "app-img-card",
  templateUrl: "./img-card.component.html",
  styleUrl: "./img-card.component.scss",
  standalone: true,
  imports: [IconComponent],
})
export class ImgCardComponent implements OnInit {
  constructor() {}

  @Input() src = "";
  @Input() error = false;
  @Input() loading = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();

  ngOnInit(): void {}
}
