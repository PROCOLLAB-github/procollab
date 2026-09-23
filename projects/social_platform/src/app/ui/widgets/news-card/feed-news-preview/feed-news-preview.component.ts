/** @format */
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { DayjsPipe } from "@corelib";
import { FeedNews } from "@domain/news/project-news.model";
import { FileModel } from "@domain/file/file.model";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";
import { IconComponent } from "@ui/primitives";
import { ClickOutsideModule } from "ng-click-outside";
import { FeedNewsModalComponent } from "../feed-news-modal/feed-news-modal.component";

/** Компактное представление только глобальной ленты; данные и действия остаются у NewsCard. */
@Component({
  selector: "app-feed-news-preview",
  imports: [RouterLink, DayjsPipe, IconComponent, ClickOutsideModule, FeedNewsModalComponent],
  templateUrl: "./feed-news-preview.component.html",
  styleUrl: "./feed-news-preview.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedNewsPreviewComponent {
  readonly news = input.required<FeedNews>();
  readonly type = input.required<"project" | "people">();
  readonly headline = input.required<string>();
  readonly summary = input.required<string>();
  readonly images = input<FileModel[]>([]);
  readonly files = input<FileModel[]>([]);
  readonly resourceLink = input.required<(string | number)[]>();
  readonly publishedAt = input("");
  readonly industryId = input<number>();
  readonly placeholderUrl = input("");
  readonly isOwner = input(false);
  readonly like = output<void>();
  readonly share = output<void>();
  readonly edit = output<void>();
  readonly delete = output<void>();

  protected readonly industryRepository = inject(IndustryRepositoryPort);
  protected readonly truncated = signal(false);
  protected readonly modalOpen = signal(false);
  protected readonly menuOpen = signal(false);
  protected trigger: HTMLElement | null = null;
  private readonly titleElement = viewChild<ElementRef<HTMLElement>>("titleElement");
  private readonly summaryElement = viewChild<ElementRef<HTMLElement>>("summaryElement");

  constructor() {
    // Длина строки не определяет обрезание: учитываем реальную ширину, переносы и загруженный шрифт.
    afterRenderEffect(onCleanup => {
      this.headline();
      this.summary();
      const elements = [this.titleElement(), this.summaryElement()]
        .filter((ref): ref is ElementRef<HTMLElement> => !!ref)
        .map(ref => ref.nativeElement);
      let active = true;
      const measure = () => {
        if (!active) return;
        this.truncated.set(
          elements.some(
            el => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1,
          ),
        );
      };
      measure();
      const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
      elements.forEach(el => observer?.observe(el));
      void document.fonts?.ready.then(measure);
      document.fonts?.addEventListener("loadingdone", measure);
      onCleanup(() => {
        active = false;
        observer?.disconnect();
        document.fonts?.removeEventListener("loadingdone", measure);
      });
    });
  }

  /** Свободная область открывает чтение; нативные вложенные действия сохраняют своё назначение. */
  protected onCardClick(event: MouseEvent): void {
    if (
      event.target instanceof Element &&
      event.target.closest("a, button, input, textarea, select")
    )
      return;
    this.openModal(event.currentTarget as HTMLElement);
  }

  /** Enter/Space обрабатываются только на самой карточке, без перехвата клавиш её ссылок и кнопок. */
  protected onCardKeydown(event: Event): void {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    this.openModal(event.currentTarget as HTMLElement);
  }

  /** Запоминаем реальный trigger для возврата фокуса; новость не копируется и не запрашивается повторно. */
  protected openModal(trigger: HTMLElement): void {
    this.trigger = trigger;
    this.modalOpen.set(true);
  }
}
