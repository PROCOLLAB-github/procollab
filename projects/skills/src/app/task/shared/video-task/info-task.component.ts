/** @format */

import { Component, inject, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import type { InfoSlide } from "../../../../models/step.model";
import { DomSanitizer, type SafeResourceUrl } from "@angular/platform-browser";
import { ParseBreaksPipe, ParseLinksPipe, YtExtractService } from "@corelib";

/**
 * Компонент информационного слайда с видео/изображением
 * Отображает информационный контент с поддержкой различных медиа-форматов
 *
 * Входные параметры:
 * @Input data - данные информационного слайда типа InfoSlide
 *
 * Функциональность:
 * - Отображает текст и описание слайда
 * - Поддерживает видео (mp4), GIF и изображения (webp, jpg, png)
 * - Извлекает YouTube ссылки из текста
 * - Автоматически определяет тип контента по расширению файла
 * - Адаптивная компоновка для разных типов медиа
 */
@Component({
  selector: "app-info-task",
  standalone: true,
  imports: [CommonModule, ParseLinksPipe, ParseBreaksPipe],
  templateUrl: "./info-task.component.html",
  styleUrl: "./info-task.component.scss",
})
export class InfoTaskComponent {
  @Input({ required: true }) data!: InfoSlide; // Данные информационного слайда

  sanitizer = inject(DomSanitizer); // Сервис для безопасной работы с HTML
  ytExtractService = inject(YtExtractService); // Сервис для извлечения YouTube ссылок

  videoUrl?: SafeResourceUrl; // Безопасная ссылка на видео
  description: any; // Обработанное описание
  sanitizedFileUrl?: SafeResourceUrl; // Безопасная ссылка на файл
  contentType: "gif" | "webp" | "mp4" | string = ""; // Тип медиа-контента

  ngOnInit(): void {
    // Извлекаем YouTube ссылку из текста
    const res = this.ytExtractService.transform(this.data.text);

    // Определяем тип контента по расширению файла
    if (this.data.files.length) {
      this.contentType = this.data.files[0].slice(-3).toLocaleLowerCase();
    }

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
