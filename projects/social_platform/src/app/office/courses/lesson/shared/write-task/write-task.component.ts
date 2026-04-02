/** @format */

import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { TruncatePipe } from "projects/core/src/lib/pipes/truncate.pipe";
import { TruncateHtmlPipe } from "projects/core/src/lib/pipes/truncate-html.pipe";
import { UploadFileComponent } from "@ui/components/upload-file/upload-file.component";
import { IconComponent } from "@ui/components";
import { FileItemComponent } from "@ui/components/file-item/file-item.component";
import { FileService } from "@core/services/file.service";
import { Task } from "@models/courses.model";
import { FileModel } from "@office/models/file.model";
import { resolveVideoUrlForIframe } from "@utils/video-url-embed";
import { animateContentHeight } from "@utils/animate-content-height";
import { isHtmlTextTruncated } from "@utils/is-html-text-truncated";
import { ImagePreviewDirective } from "../image-preview/image-preview.directive";

@Component({
  selector: "app-write-task",
  standalone: true,
  imports: [
    CommonModule,
    TruncatePipe,
    TruncateHtmlPipe,
    UploadFileComponent,
    IconComponent,
    FileItemComponent,
    ImagePreviewDirective,
  ],
  templateUrl: "./write-task.component.html",
  styleUrl: "./write-task.component.scss",
})
export class WriteTaskComponent implements OnInit {
  private readonly fileService = inject(FileService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdRef = inject(ChangeDetectorRef);

  @Input({ required: true }) data!: Task;
  @Input() type: "text" | "text-file" = "text";
  @Input() success = false;
  @Input() disabled = false;

  @Output() update = new EventEmitter<{ text: string; fileUrls?: string[] }>();

  readonly maxLength = 1000;

  uploadedFiles = signal<FileModel[]>([]);
  currentLength = signal(0);
  readFullDescription = false;
  cachedVideoUrl: SafeResourceUrl | null = null;
  private currentText = "";

  get truncateLimit(): number {
    return this.type === "text-file" ? 650 : 700;
  }

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

  onKeyUp(event: Event) {
    const target = event.target as HTMLTextAreaElement;

    target.style.height = "0px";
    target.style.height = target.scrollHeight + "px";

    this.currentText = target.value;
    this.currentLength.set(target.value.length);
    this.emitUpdate();
  }

  onFileUploaded(event: { url: string; name: string; size: number; mimeType: string }) {
    if (!event.url) return;

    const ext = event.name.split(".").pop()?.toLowerCase() || "";
    const file: FileModel = {
      name: event.name,
      size: event.size,
      mimeType: event.mimeType,
      link: event.url,
      extension: ext,
      datetimeUploaded: new Date().toISOString(),
      user: 0,
    };

    this.uploadedFiles.update(files => [...files, file]);
    this.emitUpdate();
  }

  onFileRemoved(index: number) {
    const file = this.uploadedFiles()[index];
    if (!file) return;

    this.fileService.deleteFile(file.link).subscribe({
      next: () => {
        this.uploadedFiles.update(files => files.filter((_, i) => i !== index));
        this.emitUpdate();
      },
      error: () => {
        this.uploadedFiles.update(files => files.filter((_, i) => i !== index));
        this.emitUpdate();
      },
    });
  }

  private emitUpdate() {
    if (this.type === "text-file") {
      this.update.emit({
        text: this.currentText,
        fileUrls: this.uploadedFiles().map(f => f.link),
      });
    } else {
      this.update.emit({ text: this.currentText });
    }
  }
}
