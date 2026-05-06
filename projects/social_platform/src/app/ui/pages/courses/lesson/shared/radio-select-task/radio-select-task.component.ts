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
import { TruncateHtmlPipe } from "@core/lib/pipes/truncate-html.pipe";
import { Task } from "@domain/courses/courses.model";
import { resolveVideoUrlForIframe } from "@utils/video-url-embed";
import { animateContentHeight } from "@utils/animate-content-height";
import { isHtmlTextTruncated } from "@utils/is-html-text-truncated";
import { FileItemComponent } from "@ui/primitives/file-item/file-item.component";
import { ImagePreviewDirective } from "../image-preview/image-preview.directive";
import { TruncatePipe } from "@core/lib/pipes/formatters/truncate.pipe";

@Component({
  selector: "app-radio-select-task",
  standalone: true,
  imports: [CommonModule, TruncatePipe, TruncateHtmlPipe, FileItemComponent, ImagePreviewDirective],
  templateUrl: "./radio-select-task.component.html",
  styleUrl: "./radio-select-task.component.scss",
})
export class RadioSelectTaskComponent implements OnInit {
  private readonly cdRef = inject(ChangeDetectorRef);

  @Input({ required: true }) data!: Task;
  @Input() success = false;
  @Input() hint = "";
  @Input() disabled = false;

  @Input()
  set error(value: boolean) {
    this._error.set(value);

    if (value) {
      setTimeout(() => {
        this.result.set({ answerId: null });
        this._error.set(false);
      }, 1000);
    }
  }

  get error() {
    return this._error();
  }

  @Output() update = new EventEmitter<{ answerId: number }>();

  result = signal<{ answerId: number | null }>({ answerId: null });
  _error = signal<boolean>(false);
  readFullDescription = false;
  cachedVideoUrl: SafeResourceUrl | null = null;
  readonly truncateLimit = 700;

  get descriptionExpandable(): boolean {
    return isHtmlTextTruncated(this.data?.bodyText, this.truncateLimit);
  }

  constructor(private sanitizer: DomSanitizer) {}

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

  onSelect(id: number) {
    if (this.disabled) return;
    this.result.set({ answerId: id });
    this.update.emit({ answerId: id });
  }
}
