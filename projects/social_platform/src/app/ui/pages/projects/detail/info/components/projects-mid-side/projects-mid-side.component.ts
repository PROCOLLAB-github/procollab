/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  Input,
  ViewChild,
  WritableSignal,
} from "@angular/core";
import { NewsFormComponent } from "@ui/widgets/news-form/news-form.component";
import { ProjectDirectionCard } from "@ui/widgets/project-direction-card/project-direction-card.component";
import { NewsCardComponent } from "@ui/widgets/news-card/news-card.component";
import { NewsInfoService } from "@api/news/news-info.service";
import { ProjectsDetailUIInfoService } from "@api/project/facades/detail/ui/projects-detail-ui.service";
import { ExpandService } from "@api/expand/expand.service";
import { Project } from "@domain/project/project.model";
import { AppRoutes } from "@api/paths/app-routes";
import { ProjectsDetailService } from "@api/project/facades/detail/projects-detail.service";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { FeedNews } from "@domain/news/project-news.model";
import { Collaborator } from "@domain/project/collaborator.model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";

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
  @ViewChild("newsEl") newsEl?: ElementRef;
  @ViewChild("contentEl") contentEl?: ElementRef;
  @ViewChild("descEl") descEl?: ElementRef;

  // Ссылки на дочерние компоненты
  @ViewChild(NewsFormComponent) newsFormComponent?: NewsFormComponent;
  @ViewChild(NewsCardComponent) newsCardComponent?: NewsCardComponent;

  private readonly projectsDetailService = inject(ProjectsDetailService);
  private readonly newsInfoService = inject(NewsInfoService);
  private readonly projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);
  private readonly profileInfoService = inject(ProfileInfoService);
  private readonly expandService = inject(ExpandService);

  protected readonly directions = this.projectsDetailUIInfoService.directions;

  protected readonly AppRoutes = AppRoutes;

  // Состояние компонента
  protected readonly profile = this.profileInfoService.profile;
  protected readonly news = this.newsInfoService.news; // Массив новостей
  protected readonly readFullDescription = this.expandService.readFullDescription; // Флаг развернутого описания
  protected readonly descriptionExpandable = this.expandService.descriptionExpandable; // Флаг необходимости кнопки "Читать полностью"

  onNewsInVew(entries: IntersectionObserverEntry[]): void {
    this.projectsDetailService.onNewsInVew(entries);
  }

  onAddNews(news: { text: string; files: string[] }): void {
    this.projectsDetailService
      .onAddNews(news)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => this.newsFormComponent?.onResetForm(),
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
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => this.newsCardComponent?.onCloseEditMode(),
      });
  }

  onRemoveMember(id: Collaborator["userId"]) {
    this.projectsDetailService.onRemoveMember(id);
  }

  onTransferOwnership(id: Collaborator["userId"]) {
    this.projectsDetailService.onTransferOwnership(id);
  }

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    this.expandService.onExpand("description", elem, expandedClass, isExpanded);
  }
}
