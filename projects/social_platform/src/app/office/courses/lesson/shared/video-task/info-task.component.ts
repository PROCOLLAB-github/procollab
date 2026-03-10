/** @format */

import { Component, inject, Input, type OnChanges } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, type SafeResourceUrl } from "@angular/platform-browser";
import { TruncateHtmlPipe } from "projects/core/src/lib/pipes/truncate-html.pipe";
import { TruncatePipe } from "projects/core/src/lib/pipes/truncate.pipe";
import { InfoSlide } from "projects/skills/src/models/step.model";
import { resolveVideoUrlForIframe } from "@utils/video-url-embed";

/**
 * Компонент информационного слайда с видео/изображением
 * Отображает информационный контент с поддержкой различных медиа-форматов
 *
 * Входные параметры:
 * @Input data - данные информационного слайда типа InfoSlide
 *
 * Функциональность:
 * - Отображает текст и описание слайда
 * - Поддерживает видео в iframe (YouTube, RuTube, Google Drive, прямые видео-файлы)
 * - Автоматически определяет тип контента по URL/расширению файла
 * - Адаптивная компоновка для разных типов медиа
 */
@Component({
  selector: "app-info-task",
  standalone: true,
  imports: [CommonModule, TruncateHtmlPipe, TruncatePipe],
  templateUrl: "./info-task.component.html",
  styleUrl: "./info-task.component.scss",
})
export class InfoTaskComponent implements OnChanges {
  @Input({ required: true }) data!: InfoSlide; // Данные информационного слайда

  sanitizer = inject(DomSanitizer); // Сервис для безопасной работы с HTML

  sourceType: "embed" | "img" | null = null;
  mediaUrl?: SafeResourceUrl | string;

  ngOnChanges(): void {
    this.mediaUrl = undefined;
    this.sourceType = null;

    const firstFile = this.data.files[0]?.toLowerCase();
    if (firstFile && /\.(webp|png|jpe?g|gif|svg)(?:$|[?#])/i.test(firstFile)) {
      this.sourceType = "img";
    }

    const iframeUrl = resolveVideoUrlForIframe(this.data.videoUrl);
    if (iframeUrl) {
      this.mediaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(iframeUrl);
      this.sourceType = "embed";
    }
  }
}
