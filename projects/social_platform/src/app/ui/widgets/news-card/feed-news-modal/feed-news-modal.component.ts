/** @format */
import { A11yModule, CdkTrapFocus } from "@angular/cdk/a11y";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import { DayjsPipe, ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { FeedNews } from "@domain/news/project-news.model";
import { FileModel } from "@domain/file/file.model";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { IconComponent } from "@ui/primitives";
import { CarouselComponent } from "../carousel/carousel.component";

/** Чтение уже загруженной новости: общий input для лайков, без detail-запроса и нового события просмотра. */
@Component({
  selector: "app-feed-news-modal",
  imports: [
    ModalComponent,
    A11yModule,
    RouterLink,
    DayjsPipe,
    ParseLinksPipe,
    ParseBreaksPipe,
    IconComponent,
    CarouselComponent,
  ],
  templateUrl: "./feed-news-modal.component.html",
  styleUrl: "./feed-news-modal.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedNewsModalComponent implements AfterViewInit {
  readonly news = input.required<FeedNews>();
  readonly type = input.required<"project" | "people">();
  readonly images = input<FileModel[]>([]);
  readonly files = input<FileModel[]>([]);
  readonly resourceLink = input.required<(string | number)[]>();
  readonly publishedAt = input("");
  readonly placeholderUrl = input("");
  readonly trigger = input<HTMLElement | null>(null);
  readonly like = output<void>();
  readonly share = output<void>();
  readonly closed = output<void>();
  protected readonly open = signal(true);
  protected readonly attached = signal(false);
  private readonly destroyRef = inject(DestroyRef);
  private restoreFocus = true;

  @ViewChild(ModalComponent) private modal!: ModalComponent;
  @ViewChild(ModalComponent, { read: ViewContainerRef }) private modalContainer!: ViewContainerRef;
  @ViewChild(CdkTrapFocus) private trap!: CdkTrapFocus;
  @ViewChild("closeButton") private closeButton!: ElementRef<HTMLButtonElement>;

  constructor() {
    this.destroyRef.onDestroy(() => {
      const overlay = this.modal?.overlayRef;
      // У shared modal отложенный setter: после уничтожения локального владельца attach должен стать no-op.
      if (this.modal) this.modal.overlayRef = undefined;
      overlay?.dispose();
    });
  }

  /** Focus trap включается после настоящего attachment portal, без таймеров ожидания DOM. */
  ngAfterViewInit(): void {
    const overlay = this.modal.overlayRef!;
    const owner = this.modalContainer.injector.get(DestroyRef);
    overlay
      .attachments()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.open()) {
          overlay.detach();
          return;
        }
        this.attached.set(true);
        this.trap.focusTrap.attachAnchors();
        this.trap.enabled = true;
        this.closeButton.nativeElement.focus();
      });
    overlay
      .detachments()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.attached.set(false);
        this.trap.enabled = false;
        if (this.destroyRef.destroyed || owner.destroyed) return;
        const trigger = this.trigger();
        if (this.restoreFocus && trigger?.isConnected) trigger.focus();
        this.closed.emit();
      });
    overlay
      .keydownEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          this.close();
        }
      });
  }

  /** Закрытие через крестик, Escape и backdrop использует один жизненный цикл и возвращает фокус. */
  close(): void {
    this.open.set(false);
  }

  /** При навигации источник фокуса покидает страницу: не возвращаем его в старую карточку. */
  protected leave(): void {
    this.restoreFocus = false;
    this.close();
  }
}
