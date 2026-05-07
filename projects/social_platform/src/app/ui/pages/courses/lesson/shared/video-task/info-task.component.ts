/** @format */

import { ChangeDetectorRef, Component, inject, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { TruncateHtmlPipe } from "@core/lib/pipes/truncate-html.pipe";
import { resolveVideoUrlForIframe } from "@utils/video-url-embed";
import { animateContentHeight } from "@utils/animate-content-height";
import { isHtmlTextTruncated } from "@utils/is-html-text-truncated";
import { ImagePreviewDirective } from "../image-preview/image-preview.directive";
import { Task } from "@domain/courses/courses.model";
import { FileItemComponent } from "@ui/primitives/file-item/file-item.component";
import { TruncatePipe } from "@core/lib/pipes/formatters/truncate.pipe";

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
export class InfoTaskComponent implements OnInit {
  @Input({ required: true }) data!: Task; // Данные информационной задачи

  private readonly sanitizer = inject(DomSanitizer); // Сервис для безопасной работы с HTML
  private readonly cdRef = inject(ChangeDetectorRef);

  readFullDescription = false;
  cachedVideoUrl: SafeResourceUrl | null = null;
  readonly truncateLimit = 700;

  get descriptionExpandable(): boolean {
    return isHtmlTextTruncated(this.data?.bodyText, this.truncateLimit);
  }

  ngOnInit(): void {
    const iframeUrl = resolveVideoUrlForIframe(this.data?.videoUrl);
    this.cachedVideoUrl = iframeUrl
      ? this.sanitizer.bypassSecurityTrustResourceUrl(iframeUrl)
      : null;
  }

  onToggleDescription(elem: HTMLElement): void {
    animateContentHeight(elem, () => {
      this.readFullDescription = !this.readFullDescription;
      this.cdRef.detectChanges();
    });
  }
}
