/** @format */

import { AsyncPipe, CommonModule } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { RouterOutlet, RouterLink } from "@angular/router";
import { Collaborator } from "projects/social_platform/src/app/domain/project/collaborator.model";
import { IndustryService } from "projects/social_platform/src/app/api/industry/industry.service";
import { ParseBreaksPipe, ParseLinksPipe } from "projects/core";
import { ProjectDirectionCard } from "../../../../shared/project-direction-card/project-direction-card.component";
import { IconComponent } from "@uilib";
import { NewsFormComponent } from "@ui/components/news-form/news-form.component";
import { NewsCardComponent } from "@ui/components/news-card/news-card.component";
import { TruncatePipe } from "projects/core/src/lib/pipes/formatters/truncate.pipe";
import { UserLinksPipe } from "projects/core/src/lib/pipes/user/user-links.pipe";
import { AuthService } from "projects/social_platform/src/app/api/auth";
import { FeedNews } from "projects/social_platform/src/app/domain/project/project-news.model";
import { ProjectsDetailService } from "projects/social_platform/src/app/api/project/facades/detail/projects-detail.service";
import { ProjectsDetailUIInfoService } from "projects/social_platform/src/app/api/project/facades/detail/ui/projects-detail-ui.service";
import { NewsInfoService } from "projects/social_platform/src/app/api/news/news-info.service";
import { ExpandService } from "projects/social_platform/src/app/api/expand/expand.service";

/**
 * КОМПОНЕНТ ДЕТАЛЬНОЙ ИНФОРМАЦИИ О ПРОЕКТЕ
 *
 * Этот компонент отображает подробную информацию о проекте, включая:
 * - Основную информацию (название, описание, обложка)
 * - Команду проекта с возможностью управления
 * - Новости проекта с возможностью добавления/редактирования
 * - Вакансии, достижения и контакты
 * - Функции подписки и поддержки проекта
 *
 * @param:
 * - Получает данные проекта через резолвер из маршрута
 * - Использует параметр projectId из URL
 *
 * - Отображение информации о проекте
 * - Управление подпиской на проект
 * - Добавление/редактирование/удаление новостей
 * - Управление командой проекта (для лидера)
 * - Выход из проекта
 * - Передача лидерства другому участнику
 *
 * @returns:
 * - Отображает HTML-шаблон с информацией о проекте
 * - Обрабатывает пользовательские действия через методы компонента
 */
@Component({
  selector: "app-detail",
  templateUrl: "./info.component.html",
  styleUrl: "./info.component.scss",
  standalone: true,
  imports: [
    RouterOutlet,
    IconComponent,
    AsyncPipe,
    RouterOutlet,
    UserLinksPipe,
    ParseBreaksPipe,
    ParseLinksPipe,
    TruncatePipe,
    CommonModule,
    ProjectDirectionCard,
    NewsCardComponent,
    NewsFormComponent,
    RouterLink,
  ],
})
export class ProjectInfoComponent implements OnInit, AfterViewInit, OnDestroy {
  // Ссылки на элементы DOM
  @ViewChild("newsEl") newsEl?: ElementRef;
  @ViewChild("contentEl") contentEl?: ElementRef;
  @ViewChild("descEl") descEl?: ElementRef;

  // Ссылки на дочерние компоненты
  @ViewChild(NewsFormComponent) newsFormComponent?: NewsFormComponent;
  @ViewChild(NewsCardComponent) newsCardComponent?: NewsCardComponent;

  private readonly projectsDetailService = inject(ProjectsDetailService);
  private readonly projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);
  private readonly newsInfoService = inject(NewsInfoService);
  private readonly expandService = inject(ExpandService);
  protected readonly authService = inject(AuthService);
  protected readonly industryService = inject(IndustryService);

  // Observable с подписчиками проекта
  protected readonly profileId = this.projectsDetailUIInfoService.profileId;

  // Данные о проекте
  protected readonly project = this.projectsDetailUIInfoService.project;
  protected readonly directions = this.projectsDetailUIInfoService.directions;

  // Состояние компонента
  protected readonly news = this.newsInfoService.news; // Массив новостей
  protected readonly readFullDescription = this.expandService.readFullDescription; // Флаг развернутого описания
  protected readonly descriptionExpandable = this.expandService.descriptionExpandable; // Флаг необходимости кнопки "Читать полностью"
  protected readonly readAllAchievements = this.expandService.readAllAchievements; // Флаг показа всех достижений
  protected readonly readAllVacancies = this.expandService.readAllVacancies; // Флаг показа всех вакансий
  protected readonly readAllMembers = this.expandService.readAllMembers; // Флаг показа всех участников
  protected readonly isCompleted = this.projectsDetailUIInfoService.isCompleted; // Флаг завершенности проектe

  /**
   * Инициализация компонента
   * Устанавливает заголовок навигации, загружает новости, определяет статус подписки
   */
  ngOnInit(): void {
    this.projectsDetailService.initializationProjectInfo();
  }

  /**
   * Хук после инициализации представления
   * Перемещает новости в контентную область на десктопе, проверяет необходимость кнопки "Читать полностью"
   */
  ngAfterViewInit(): void {
    this.projectsDetailService.initCheckDescription();
  }

  /**
   * Очистка подписок при уничтожении компонента
   */
  ngOnDestroy(): void {
    this.projectsDetailService.destroy();
  }

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
    this.projectsDetailService.onAddNews(news).subscribe({
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
    this.projectsDetailService.onEditNews(news, newsItemId).subscribe({
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
