/** @format */

import { Component, EventEmitter, Input, type OnInit, Output, inject } from "@angular/core";
import { CommonModule, JsonPipe } from "@angular/common";
import type { WriteQuestion } from "../../../../models/step.model";
import { ParseBreaksPipe, YtExtractService } from "@corelib";
import { DomSanitizer, type SafeResourceUrl } from "@angular/platform-browser";

/**
 * Компонент задачи с текстовым вводом
 * Позволяет пользователю вводить текстовый ответ в textarea
 *
 * Входные параметры:
 * @Input data - данные вопроса типа WriteQuestion
 * @Input success - флаг успешного выполнения задания
 *
 * Выходные события:
 * @Output update - событие обновления ответа с текстом
 *
 * Функциональность:
 * - Отображает текст задания и описание
 * - Поддерживает встроенные видео и файлы
 * - Автоматически изменяет высоту textarea при вводе
 * - Извлекает YouTube ссылки из описания
 */
@Component({
  selector: "app-write-task",
  standalone: true,
  imports: [CommonModule, JsonPipe, ParseBreaksPipe],
  templateUrl: "./write-task.component.html",
  styleUrl: "./write-task.component.scss",
})
export class WriteTaskComponent implements OnInit {
  @Input({ required: true }) data!: WriteQuestion; // Данные вопроса
  @Output() update = new EventEmitter<{ text: string }>(); // Событие обновления ответа

  @Input() success = false; // Флаг успешного выполнения

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
   * Обработчик ввода текста в textarea
   * Автоматически изменяет высоту поля и отправляет событие обновления
   * @param event - событие клавиатуры
   */
  onKeyUp(event: KeyboardEvent) {
    const target = event.target as HTMLTextAreaElement;

    // Автоматическое изменение высоты textarea
    target.style.height = "0px";
    target.style.height = target.scrollHeight + "px";

    // Отправляем событие с введенным текстом
    this.update.emit({ text: target.value });
  }
}
