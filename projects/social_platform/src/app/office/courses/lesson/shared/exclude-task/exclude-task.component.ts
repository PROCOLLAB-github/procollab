/** @format */

import { Component, EventEmitter, inject, Input, type OnInit, Output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ParseBreaksPipe } from "@corelib";
import { CheckboxComponent } from "@ui/components";
import { TruncateHtmlPipe } from "projects/core/src/lib/pipes/truncate-html.pipe";
import { TruncatePipe } from "projects/core/src/lib/pipes/truncate.pipe";
import { Task } from "@office/models/courses.model";

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
  imports: [CommonModule, TruncatePipe, CheckboxComponent],
  templateUrl: "./exclude-task.component.html",
  styleUrl: "./exclude-task.component.scss",
})
export class ExcludeTaskComponent implements OnInit {
  private readonly sanitizer = inject(DomSanitizer);

  @Input({ required: true }) data!: Task; // Данные вопроса
  @Input() hint!: string; // Текст подсказки
  @Output() update = new EventEmitter<number[]>(); // Событие обновления выбранных ответов

  @Input() success = false; // Флаг успешного выполнения

  @Input()
  set error(value: boolean) {
    this._error.set(value);

    if (value) {
      setTimeout(() => {
        this.result.set([]);
        this._error.set(false);
      }, 1000);
    }
  }

  get error() {
    return this._error();
  }

  result = signal<number[]>([]);
  _error = signal<boolean>(false);

  getSafeVideoUrl(): SafeResourceUrl | null {
    if (!this.data?.videoUrl) {
      return null;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.data.videoUrl);
  }

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

  ngOnInit(): void {}
}
