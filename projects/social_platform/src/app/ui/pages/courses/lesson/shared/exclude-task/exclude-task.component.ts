/** @format */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  Input,
  OnInit,
  output,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { CheckboxComponent } from "@ui/primitives";
import { Task } from "@domain/courses/courses.model";
import { resolveVideoUrlForIframe } from "@utils/video-url-embed";
import { animateContentHeight } from "@utils/animate-content-height";
import { isHtmlTextTruncated } from "@utils/is-html-text-truncated";
import { ImagePreviewDirective } from "../image-preview/image-preview.directive";
import { TruncateHtmlPipe, TruncatePipe } from "@core/public-api";

/** Задача на исключение лишнего с множественным выбором. */
@Component({
  selector: "app-exclude-task",
  imports: [CommonModule, TruncatePipe, TruncateHtmlPipe, CheckboxComponent, ImagePreviewDirective],
  templateUrl: "./exclude-task.component.html",
  styleUrl: "./exclude-task.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExcludeTaskComponent implements OnInit {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdRef = inject(ChangeDetectorRef);

  readonly data = input.required<Task>();
  readonly hint = input<string>();

  readonly success = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly update = output<number[]>();

  @Input()
  set error(value: boolean) {
    this._error.set(value);

    if (value) {
      setTimeout(() => {
        this.result.set([]);
        this._error.set(false);
      }, 1000);
    }
  }

  get error() {
    return this._error();
  }

  result = signal<number[]>([]);
  _error = signal<boolean>(false);
  readFullDescription = false;
  cachedVideoUrl: SafeResourceUrl | null = null;
  readonly truncateLimit = 700;

  get descriptionExpandable(): boolean {
    return isHtmlTextTruncated(this.data()?.bodyText, this.truncateLimit);
  }

  ngOnInit(): void {
    const iframeUrl = resolveVideoUrlForIframe(this.data()?.videoUrl);
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
    if (this.disabled()) return;
    if (this.result().includes(id)) {
      this.result.set(this.result().filter(i => i !== id));
    } else {
      this.result.set([...this.result(), id]);
    }

    this.update.emit(this.result());
  }
}
