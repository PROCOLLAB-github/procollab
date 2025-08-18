/** @format */

import { Component, EventEmitter, inject, Input, Output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import type { SingleQuestion, SingleQuestionError } from "../../../../models/step.model";
import { DomSanitizer, type SafeResourceUrl } from "@angular/platform-browser";
import { ParseBreaksPipe, YtExtractService } from "@corelib";

/**
 * Компонент задачи с выбором одного варианта (радио-кнопки)
 * Отображает вопрос с несколькими вариантами ответа, из которых можно выбрать только один
 *
 * Входные параметры:
 * @Input data - данные вопроса типа SingleQuestion
 * @Input success - флаг успешного выполнения
 * @Input hint - текст подсказки
 * @Input error - объект ошибки для сброса состояния
 *
 * Выходные события:
 * @Output update - событие обновления с ID выбранного ответа
 *
 * Функциональность:
 * - Отображает вопрос и варианты ответов
 * - Поддерживает встроенные видео и файлы
 * - Позволяет выбрать только один вариант ответа
 * - Извлекает YouTube ссылки из описания
 */
@Component({
  selector: "app-radio-select-task",
  standalone: true,
  imports: [CommonModule, ParseBreaksPipe],
  templateUrl: "./radio-select-task.component.html",
  styleUrl: "./radio-select-task.component.scss",
})
export class RadioSelectTaskComponent {
  @Input({ required: true }) data!: SingleQuestion; // Данные вопроса
  @Input() success = false; // Флаг успешного выполнения
  @Input() hint!: string; // Текст подсказки

  // Сеттер для обработки ошибок и сброса состояния
  @Input()
  set error(value: SingleQuestionError | null) {
    this._error.set(value);

    if (value !== null) {
      this.result.set({ answerId: null }); // Сбрасываем выбранный ответ при ошибке
    }
  }

  get error() {
    return this._error();
  }

  @Output() update = new EventEmitter<{ answerId: number }>(); // Событие обновления выбора

  // Состояние компонента
  result = signal<{ answerId: number | null }>({ answerId: null }); // Выбранный ответ
  _error = signal<SingleQuestionError | null>(null); // Состояние ошибки

  sanitizer = inject(DomSanitizer); // Сервис для безопасной работы с HTML
  ytExtractService = inject(YtExtractService); // Сервис для извлечения YouTube ссылок

  videoUrl?: SafeResourceUrl; // Безопасная ссылка на видео
  description: any; // Обработанное описание
  sanitizedFileUrl?: SafeResourceUrl; // Безопасная ссылка на файл

  ngOnInit(): void {
    // Извлекаем YouTube ссылку из описания
    const res = this.ytExtractService.transform(this.data.description);

    if (res.extractedLink)
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.extractedLink);

    // Обрабатываем файлы, если они есть
    if (this.data.files.length) {
      this.sanitizedFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.files[0]);
    }

    // Безопасно обрабатываем HTML в описании
    this.description = this.sanitizer.bypassSecurityTrustHtml(this.data.description);
  }

  /**
   * Обработчик выбора варианта ответа
   * @param id - ID выбранного ответа
   */
  onSelect(id: number) {
    this.result.set({ answerId: id });
    this.update.emit({ answerId: id });
  }
}
