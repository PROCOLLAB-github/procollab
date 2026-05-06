/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
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
import { ProjectsDetailService } from "@api/project/facades/detail/projects-detail.service";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { FeedNews } from "@domain/project/project-news.model";
import { Collaborator } from "@domain/project/collaborator.model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AuthInfoService } from "@api/auth/facades/auth-info.service";

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
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsMidSideComponent {
  @Input() project!: WritableSignal<Project | undefined>;

  // Ссылки на элементы DOM
  @ViewChild("newsEl") newsEl?: ElementRef;
  @ViewChild("contentEl") contentEl?: ElementRef;
  @ViewChild("descEl") descEl?: ElementRef;

  // Ссылки на дочерние компоненты
  @ViewChild(NewsFormComponent) newsFormComponent?: NewsFormComponent;
  @ViewChild(NewsCardComponent) newsCardComponent?: NewsCardComponent;

  protected readonly authRepository = inject(AuthInfoService);
  private readonly projectsDetailService = inject(ProjectsDetailService);
  private readonly newsInfoService = inject(NewsInfoService);
  private readonly projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);
  private readonly expandService = inject(ExpandService);

  protected readonly directions = this.projectsDetailUIInfoService.directions;

  // Состояние компонента
  protected readonly news = this.newsInfoService.news; // Массив новостей
  protected readonly readFullDescription = this.expandService.readFullDescription; // Флаг развернутого описания
  protected readonly descriptionExpandable = this.expandService.descriptionExpandable; // Флаг необходимости кнопки "Читать полностью"

  /**
   * Обработчик появления новостей в области видимости
   * Отмечает новости как просмотренные
   * @param entries - массив элементов, попавших в область видимости
   */
  onNewsInVew(entries: IntersectionObserverEntry[]): void {
    this.projectsDetailService.onNewsInVew(entries);
  }

  /**
   * Добавление новой новости
   * @param news - объект с текстом и файлами новости
   */
  onAddNews(news: { text: string; files: string[] }): void {
    this.projectsDetailService
      .onAddNews(news)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => this.newsFormComponent?.onResetForm(),
      });
  }

  /**
   * Удаление новости
   * @param newsId - ID удаляемой новости
   */
  onDeleteNews(newsId: number): void {
    this.projectsDetailService.onDeleteNews(newsId);
  }

  /**
   * Переключение лайка новости
   * @param newsId - ID новости для лайка
   */
  onLike(newsId: number) {
    this.projectsDetailService.onLike(newsId);
  }

  /**
   * Редактирование новости
   * @param news - обновленные данные новости
   * @param newsItemId - ID редактируемой новости
   */
  onEditNews(news: FeedNews, newsItemId: number) {
    this.projectsDetailService
      .onEditNews(news, newsItemId)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => this.newsCardComponent?.onCloseEditMode(),
      });
  }

  /**
   * Удаление участника из проекта
   * @param id - ID удаляемого участника
   */
  onRemoveMember(id: Collaborator["userId"]) {
    this.projectsDetailService.onRemoveMember(id);
  }

  /**
   * Передача лидерства другому участнику
   * @param id - ID нового лидера
   */
  onTransferOwnership(id: Collaborator["userId"]) {
    this.projectsDetailService.onTransferOwnership(id);
  }

  /**
   * Раскрытие/сворачивание описания профиля
   * @param elem - DOM элемент описания
   * @param expandedClass - CSS класс для раскрытого состояния
   * @param isExpanded - текущее состояние (раскрыто/свернуто)
   */
  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    this.expandService.onExpand("description", elem, expandedClass, isExpanded);
  }
}
