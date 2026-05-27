/** @format */

import { ChangeDetectorRef, Component, inject, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { resolveVideoUrlForIframe } from "@utils/video-url-embed";
import { animateContentHeight } from "@utils/animate-content-height";
import { isHtmlTextTruncated } from "@utils/is-html-text-truncated";
import { ImagePreviewDirective } from "../image-preview/image-preview.directive";
import { Task } from "@domain/courses/courses.model";
import { FileItemComponent } from "@ui/primitives/file-item/file-item.component";
import { TruncatePipe, TruncateHtmlPipe } from "@corelib";

/** Информационный слайд задачи с видео и текстом. */
@Component({
  selector: "app-info-task",
  standalone: true,
  imports: [CommonModule, TruncateHtmlPipe, TruncatePipe, ImagePreviewDirective, FileItemComponent],
  templateUrl: "./info-task.component.html",
  styleUrl: "./info-task.component.scss",
})
export class InfoTaskComponent implements OnInit {
  @Input({ required: true }) data!: Task;

  private readonly sanitizer = inject(DomSanitizer);
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
