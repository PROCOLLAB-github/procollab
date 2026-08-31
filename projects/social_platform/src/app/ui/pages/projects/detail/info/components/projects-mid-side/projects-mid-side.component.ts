/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { NewsFormComponent } from "@ui/widgets/news-form/news-form.component";
import { ProjectDirectionCard } from "@ui/widgets/project-direction-card/project-direction-card.component";
import { NewsCardComponent } from "@ui/widgets/news-card/news-card.component";
import { NewsInfoService } from "@api/news/news-info.service";
import { ProjectsDetailUIInfoService } from "@api/project/facades/detail/ui/projects-detail-ui.service";
import { Project } from "@domain/project/project.model";
import { AppRoutes } from "@api/paths/app-routes";
import { ProjectsDetailService } from "@api/project/facades/detail/projects-detail.service";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { FeedNews } from "@domain/news/project-news.model";
import { Collaborator } from "@domain/project/collaborator.model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";

const PROJECT_DESCRIPTION_PREVIEW_LENGTH = 420;

export function buildProjectDescriptionPreview(
  description: string,
  maxLength = PROJECT_DESCRIPTION_PREVIEW_LENGTH,
): string {
  const normalizedDescription = description.trim();
  if (normalizedDescription.length <= maxLength) {
    return normalizedDescription;
  }

  const candidate = normalizedDescription.slice(0, maxLength + 1);
  const minimumNaturalBoundary = Math.floor(maxLength * 0.5);
  const paragraphBoundary = Math.max(candidate.lastIndexOf("\n\n"), candidate.lastIndexOf("\n"));
  const sentenceBoundary = [...candidate.matchAll(/[.!?](?=\s|$)/g)].at(-1)?.index ?? -1;
  const naturalBoundary = Math.max(paragraphBoundary, sentenceBoundary + 1);
  const wordBoundary = candidate.lastIndexOf(" ");
  const previewEnd =
    naturalBoundary >= minimumNaturalBoundary
      ? naturalBoundary
      : wordBoundary >= minimumNaturalBoundary
        ? wordBoundary
        : maxLength;
  const preview = normalizedDescription.slice(0, previewEnd).trimEnd();

  return /[.!?]$/.test(preview) ? preview : `${preview}…`;
}

/** Центральная колонка детали проекта: описание, новости. */
@Component({
  selector: "app-projects-mid-side",
  templateUrl: "./projects-mid-side.component.html",
  styleUrl: "./projects-mid-side.component.scss",
  imports: [
    CommonModule,
    NewsFormComponent,
    ProjectDirectionCard,
    NewsCardComponent,
    ParseLinksPipe,
    ParseBreaksPipe,
  ],
  providers: [ProjectsDetailService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsMidSideComponent {
  readonly project = input.required<Project | undefined>();

  // Ссылки на элементы DOM
  readonly newsEl = viewChild<ElementRef>("newsEl");
  readonly contentEl = viewChild<ElementRef>("contentEl");
  // Ссылки на дочерние компоненты
  readonly newsFormComponent = viewChild(NewsFormComponent);
  readonly newsCardComponent = viewChild(NewsCardComponent);

  private readonly destroyRef = inject(DestroyRef);
  private readonly projectsDetailService = inject(ProjectsDetailService);
  private readonly newsInfoService = inject(NewsInfoService);
  private readonly projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);
  private readonly profileInfoService = inject(ProfileInfoService);

  protected readonly directions = this.projectsDetailUIInfoService.directions;

  protected readonly AppRoutes = AppRoutes;

  // Состояние компонента
  protected readonly profile = this.profileInfoService.profile;
  protected readonly news = this.newsInfoService.news; // Массив новостей
  protected readonly newsPending = signal(false);
  protected readonly descriptionExpanded = signal(false);
  protected readonly fullDescription = computed(() => this.project()?.description?.trim() ?? "");
  protected readonly descriptionPreview = computed(() =>
    buildProjectDescriptionPreview(this.fullDescription()),
  );
  protected readonly descriptionExpandable = computed(
    () => this.descriptionPreview() !== this.fullDescription(),
  );
  protected readonly visibleDescription = computed(() =>
    this.descriptionExpanded() ? this.fullDescription() : this.descriptionPreview(),
  );

  onNewsInVew(entries: IntersectionObserverEntry[]): void {
    this.projectsDetailService.onNewsInVew(entries);
  }

  onAddNews(news: { text: string; files: string[] }): void {
    this.newsPending.set(true);
    this.projectsDetailService
      .onAddNews(news)
      .pipe(
        finalize(() => this.newsPending.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.newsFormComponent()?.onResetForm(),
      });
  }

  onDeleteNews(newsId: number): void {
    this.projectsDetailService.onDeleteNews(newsId);
  }

  onLike(newsId: number) {
    this.projectsDetailService.onLike(newsId);
  }

  onEditNews(news: FeedNews, newsItemId: number) {
    this.projectsDetailService
      .onEditNews(news, newsItemId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.newsCardComponent()?.onCloseEditMode(),
      });
  }

  onRemoveMember(id: Collaborator["userId"]) {
    this.projectsDetailService.onRemoveMember(id);
  }

  onTransferOwnership(id: Collaborator["userId"]) {
    this.projectsDetailService.onTransferOwnership(id);
  }

  onToggleDescription(): void {
    this.descriptionExpanded.update(expanded => !expanded);
  }
}
