/** @format */

import { Component, EventEmitter, inject, Input, type OnInit, Output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import type { ExcludeQuestion, ExcludeQuestionResponse } from "../../../../models/step.model";
import { DomSanitizer, type SafeResourceUrl } from "@angular/platform-browser";
import { ParseBreaksPipe, YtExtractService } from "@corelib";

/**
 * Компо��ент задачи на исключение лишнего
 * Позволяет пользователю выбрать несколько вариантов из предложенных (множественный выбор)
 *
 * Входные параметры:
 * @Input data - данные вопроса типа ExcludeQuestion
 * @Input hint - текст подсказки
 * @Input success - флаг успешного выполнения
 * @Input error - объект ошибки для сброса состояния
 *
 * Выходные события:
 * @Output update - событие обновления с массивом ID выбранных ответов
 *
 * Функциональность:
 * - Отображает вопрос и варианты ответов в виде тегов
 * - Поддерживает множественный выбор вариантов
 * - Поддерживает встроенные видео и файлы
 * - Извлекает YouTube ссылки из описания
 * - Визуально выделяет выбранные варианты
 */
@Component({
  selector: "app-exclude-task",
  standalone: true,
  imports: [CommonModule, ParseBreaksPipe],
  templateUrl: "./exclude-task.component.html",
  styleUrl: "./exclude-task.component.scss",
})
export class ExcludeTaskComponent implements OnInit {
  @Input({ required: true }) data!: ExcludeQuestion; // Данные вопроса
  @Input() hint!: string; // Текст подсказки
  @Output() update = new EventEmitter<number[]>(); // Событие обновления выбранных ответов

  @Input() success = false; // Флаг успешного выполнения

  // Сеттер для обработки ошибок и сброса состояния
  @Input()
  set error(value: ExcludeQuestionResponse | null) {
    this._error.set(value);

    value !== null && this.result.set([]); // Сбрасываем выбранные ответы при ошибке
  }

  get error() {
    return this._error();
  }

  // Состояние компонента
  result = signal<number[]>([]); // Массив ID выбранных ответов
  _error = signal<ExcludeQuestionResponse | null>(null); // Состояние ошибки

  sanitizer = inject(DomSanitizer); // Сервис для безопасной работы с HTML
  ytExtractService = inject(YtExtractService); // Сервис для извлечения YouTube ссылок

  videoUrl?: SafeResourceUrl; // Безопасная ссылка на видео
  description: any; // Обработанное описание
  sanitizedFileUrl?: SafeResourceUrl; // Безопасная ссылка на файл

  /**
   * Обработчик выбора/отмены выбора варианта ответа
   * Добавляет или удаляет ID из массива выбранных ответов
   * @param id - ID варианта ответа
   */
  onSelect(id: number) {
    if (this.result().includes(id)) {
      // Если вариант уже выбран, убираем его из списка
      this.result.set(this.result().filter(i => i !== id));
    } else {
      // Если вариант не выбран, добавляем его в список
      this.result.set([...this.result(), id]);
    }

    this.update.emit(this.result());
  }

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
}
