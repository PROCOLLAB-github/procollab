/** @format */

import { Component, inject, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, type SafeResourceUrl } from "@angular/platform-browser";
import { YtExtractService } from "@corelib";
import { TruncateHtmlPipe } from "projects/core/src/lib/pipes/truncate-html.pipe";
import { TruncatePipe } from "projects/core/src/lib/pipes/truncate.pipe";
import { InfoSlide } from "projects/skills/src/models/step.model";

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
  imports: [CommonModule, TruncateHtmlPipe, TruncatePipe],
  templateUrl: "./info-task.component.html",
  styleUrl: "./info-task.component.scss",
})
export class InfoTaskComponent {
  @Input({ required: true }) data!: InfoSlide; // Данные информационного слайда

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
}
