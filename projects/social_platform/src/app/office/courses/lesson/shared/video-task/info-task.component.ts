/** @format */

import { Component, inject, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, type SafeResourceUrl } from "@angular/platform-browser";
import { TruncateHtmlPipe } from "projects/core/src/lib/pipes/truncate-html.pipe";
import { TruncatePipe } from "projects/core/src/lib/pipes/truncate.pipe";
import { resolveVideoUrlForIframe } from "@utils/video-url-embed";
import { ImagePreviewDirective } from "../image-preview/image-preview.directive";
import { Task } from "@office/models/courses.model";
import { FileItemComponent } from "@ui/components/file-item/file-item.component";

/**
 * Компонент информационного слайда с видео/изображением
 * Отображает информационный контент с поддержкой различных медиа-форматов
 *
 * Входные параметры:
 * @Input data - данные информационной задачи типа Task
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
  imports: [CommonModule, TruncateHtmlPipe, TruncatePipe, ImagePreviewDirective, FileItemComponent],
  templateUrl: "./info-task.component.html",
  styleUrl: "./info-task.component.scss",
})
export class InfoTaskComponent {
  @Input({ required: true }) data!: Task; // Данные информационной задачи

  private readonly sanitizer = inject(DomSanitizer); // Сервис для безопасной работы с HTML

  private getVideoUrl(): string | null {
    return resolveVideoUrlForIframe(this.data?.videoUrl);
  }

  getSafeVideoUrl(): SafeResourceUrl | null {
    const iframeUrl = this.getVideoUrl();
    if (!iframeUrl) {
      return null;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(iframeUrl);
  }

  hasVideoUrl(): boolean {
    return !!this.getVideoUrl();
  }

  hasContent(): boolean {
    return this.hasVideoUrl() || !!this.data?.imageUrl;
  }
}
