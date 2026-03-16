/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
  ViewChild,
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
import { expandElement } from "@utils/expand-element";
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
export class FileTaskComponent implements OnInit, AfterViewInit {
  private readonly fileService = inject(FileService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdRef = inject(ChangeDetectorRef);

  @ViewChild("descEl") descEl?: ElementRef<HTMLElement>;

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
