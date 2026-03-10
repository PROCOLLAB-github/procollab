/** @format */

import { Component, EventEmitter, inject, Input, Output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { TruncatePipe } from "projects/core/src/lib/pipes/truncate.pipe";
import { UploadFileComponent } from "@ui/components/upload-file/upload-file.component";
import { IconComponent } from "@ui/components";
import { FileItemComponent } from "@ui/components/file-item/file-item.component";
import { FileService } from "@core/services/file.service";
import { Task } from "@models/courses.model";
import { FileModel } from "@office/models/file.model";
import { resolveVideoUrlForIframe } from "@utils/video-url-embed";

@Component({
  selector: "app-write-task",
  standalone: true,
  imports: [CommonModule, TruncatePipe, UploadFileComponent, IconComponent, FileItemComponent],
  templateUrl: "./write-task.component.html",
  styleUrl: "./write-task.component.scss",
})
export class WriteTaskComponent {
  private readonly fileService = inject(FileService);
  private readonly sanitizer = inject(DomSanitizer);

  @Input({ required: true }) data!: Task;
  @Input() type: "text" | "text-file" = "text";
  @Input() success = false;

  @Output() update = new EventEmitter<{ text: string; fileUrls?: string[] }>();

  uploadedFiles = signal<FileModel[]>([]);
  private currentText = "";

  getSafeVideoUrl(): SafeResourceUrl | null {
    const iframeUrl = resolveVideoUrlForIframe(this.data?.videoUrl);
    if (!iframeUrl) {
      return null;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(iframeUrl);
  }

  hasVideoUrl(): boolean {
    return !!resolveVideoUrlForIframe(this.data?.videoUrl);
  }

  onKeyUp(event: Event) {
    const target = event.target as HTMLTextAreaElement;

    target.style.height = "0px";
    target.style.height = target.scrollHeight + "px";

    this.currentText = target.value;
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
