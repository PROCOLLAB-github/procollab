/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { TruncateHtmlPipe } from "projects/core/src/lib/pipes/truncate-html.pipe";
import { TruncatePipe } from "projects/core/src/lib/pipes/truncate.pipe";
import { resolveVideoUrlForIframe } from "@utils/video-url-embed";
import { expandElement } from "@utils/expand-element";
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
export class InfoTaskComponent implements OnInit, AfterViewInit {
  @Input({ required: true }) data!: Task; // Данные информационной задачи

  private readonly sanitizer = inject(DomSanitizer); // Сервис для безопасной работы с HTML
  private readonly cdRef = inject(ChangeDetectorRef);

  @ViewChild("descEl") descEl?: ElementRef<HTMLElement>;

  descriptionExpandable = false;
  readFullDescription = false;
  cachedVideoUrl: SafeResourceUrl | null = null;

  ngOnInit(): void {
    const iframeUrl = resolveVideoUrlForIframe(this.data?.videoUrl);
    this.cachedVideoUrl = iframeUrl
      ? this.sanitizer.bypassSecurityTrustResourceUrl(iframeUrl)
      : null;
  }

  ngAfterViewInit(): void {
    const el = this.descEl?.nativeElement;
    if (el) {
      this.descriptionExpandable = el.scrollHeight > el.clientHeight;
      this.cdRef.detectChanges();
    }
  }

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }
}
