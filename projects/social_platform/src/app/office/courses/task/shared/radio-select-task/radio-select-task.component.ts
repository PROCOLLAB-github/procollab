/** @format */

import { Component, EventEmitter, inject, Input, Output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, type SafeResourceUrl } from "@angular/platform-browser";
import { ParseBreaksPipe, YtExtractService } from "@corelib";
import { TruncatePipe } from "projects/core/src/lib/pipes/truncate.pipe";
import { TruncateHtmlPipe } from "projects/core/src/lib/pipes/truncate-html.pipe";
import { SingleQuestion, SingleQuestionError } from "projects/skills/src/models/step.model";

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
  imports: [CommonModule, ParseBreaksPipe, TruncatePipe, TruncateHtmlPipe],
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

    setTimeout(() => {
      if (value !== null) {
        this.result.set({ answerId: null }); // Сбрасываем выбранный ответ при ошибке
      }

      this._error.set(null);
    }, 1000);
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

  sourceType: "embed" | "img" | null = null;
  mediaUrl?: SafeResourceUrl | string;

  ngOnInit(): void {
    if (this.data.files.length) {
      this.data.files[0].includes(".webp") ? (this.sourceType = "img") : (this.sourceType = null);
    }

    if (!this.data.videoUrl) return;

    const url = this.data.videoUrl;
    const lower = url.toLowerCase();

    // RuTube
    if (lower.includes("rutube.ru")) {
      const match = url.match(/video\/([^/?]+)/);
      if (match) {
        this.mediaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://rutube.ru/play/embed/${match[1]}`
        );
        this.sourceType = "embed";
        return;
      }
    }

    // Прямой mp4
    if (lower.includes("drive.google.com")) {
      const match = url.match(/file\/d\/([^/]+)/);
      if (match) {
        const embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;

        this.mediaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);

        this.sourceType = "embed";
        return;
      }
    }

    this.sourceType = null;
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
