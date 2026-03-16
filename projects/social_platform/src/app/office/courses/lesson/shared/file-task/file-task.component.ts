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
import { Task } from "@office/models/courses.model";
import { FileModel } from "@office/models/file.model";
import { resolveVideoUrlForIframe } from "@utils/video-url-embed";
import { animateContentHeight } from "@utils/animate-content-height";
import { isHtmlTextTruncated } from "@utils/is-html-text-truncated";
import { ImagePreviewDirective } from "../image-preview/image-preview.directive";

@Component({
  selector: "app-file-task",
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
  templateUrl: "./file-task.component.html",
  styleUrl: "./file-task.component.scss",
})
export class FileTaskComponent implements OnInit {
  private readonly fileService = inject(FileService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdRef = inject(ChangeDetectorRef);

  @Input({ required: true }) data!: Task;
  @Input() success = false;
  @Input() hint = "";

  @Input()
  set error(value: boolean) {
    this._error.set(value);

    if (value) {
      setTimeout(() => {
        this.uploadedFiles.set([]);
        this._error.set(false);
        this.update.emit([]);
      }, 1000);
    }
  }

  get error() {
    return this._error();
  }

  @Output() update = new EventEmitter<string[]>();

  _error = signal<boolean>(false);
  uploadedFiles = signal<FileModel[]>([]);
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

  onFileUploaded(event: { url: string; name: string; size: number; mimeType: string }) {
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
    this.emitLinks();
  }

  onFileRemoved(index: number) {
    const file = this.uploadedFiles()[index];
    if (!file) return;

    this.fileService.deleteFile(file.link).subscribe({
      next: () => {
        this.uploadedFiles.update(files => files.filter((_, i) => i !== index));
        this.emitLinks();
      },
      error: () => {
        this.uploadedFiles.update(files => files.filter((_, i) => i !== index));
        this.emitLinks();
      },
    });
  }

  private emitLinks() {
    this.update.emit(this.uploadedFiles().map(f => f.link));
  }
}
