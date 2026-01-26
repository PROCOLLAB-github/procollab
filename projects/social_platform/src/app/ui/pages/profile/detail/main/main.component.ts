/** @format */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";
import { expandElement } from "@utils/expand-element";
import { concatMap, filter, map, noop, Subscription } from "rxjs";
import { ProfileNewsService } from "../../../../../api/profile/profile-news.service";
import { ProfileNews } from "../../../../../domain/profile/profile-news.model";
import { ParseBreaksPipe, ParseLinksPipe, YearsFromBirthdayPipe } from "projects/core";
import { IconComponent, ButtonComponent } from "@ui/components";
import { CommonModule, NgTemplateOutlet } from "@angular/common";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { NewsFormComponent } from "@ui/components/news-form/news-form.component";
import { NewsCardComponent } from "@ui/components/news-card/news-card.component";
import { ProfileDataService } from "../../../../../api/profile/profile-date.service";
import { DirectionItem, directionItemBuilder } from "@utils/helpers/directionItemBuilder";
import { TruncatePipe } from "projects/core/src/lib/pipes/formatters/truncate.pipe";
import { UserLinksPipe } from "projects/core/src/lib/pipes/user/user-links.pipe";
import { AuthService } from "projects/social_platform/src/app/api/auth";
import { ProjectDirectionCard } from "@ui/shared/project-direction-card/project-direction-card.component";
import { ProfileDetailInfoService } from "projects/social_platform/src/app/api/profile/facades/detail/profile-detail-info.service";
import { ProfileDetailUIInfoService } from "projects/social_platform/src/app/api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { ExpandService } from "projects/social_platform/src/app/api/expand/expand.service";
import { NewsInfoService } from "projects/social_platform/src/app/api/news/news-info.service";

/**
 * Главный компонент страницы профиля пользователя
 *
 * Отображает основную информацию профиля пользователя, включая:
 * - Раздел "Обо мне" с описанием и навыками пользователя
 * - Ленту новостей пользователя с возможностью добавления, редактирования и удаления
 * - Боковую панель с информацией о проектах, образовании, работе, достижениях и контактах
 * - Систему подтверждения навыков другими пользователями
 * - Модальные окна для детального просмотра подтверждений навыков
 *
 * Функциональность:
 * - Управление новостями (CRUD операции)
 * - Система лайков для новостей
 * - Отслеживание просмотров новостей через Intersection Observer
 * - Подтверждение/отмена подтверждения навыков пользователя
 * - Раскрывающиеся списки для длинных списков (проекты, достижения и т.д.)
 * - Адаптивное отображение контента
 *
 * @implements OnInit - для инициализации и загрузки новостей
 * @implements AfterViewInit - для работы с DOM элементами
 * @implements OnDestroy - для очистки подписок и observers
 */
@Component({
  selector: "app-profile-main",
  templateUrl: "./main.component.html",
  styleUrl: "./main.component.scss",
  imports: [
    CommonModule,
    IconComponent,
    ModalComponent,
    RouterLink,
    NgTemplateOutlet,
    UserLinksPipe,
    ParseBreaksPipe,
    ParseLinksPipe,
    TruncatePipe,
    YearsFromBirthdayPipe,
    NewsCardComponent,
    NewsFormComponent,
    ProjectDirectionCard,
    ButtonComponent,
  ],
  providers: [ProfileDetailInfoService, ProfileDetailUIInfoService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ProfileMainComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("descEl") descEl?: ElementRef;
  @ViewChild(NewsFormComponent) newsFormComponent?: NewsFormComponent;
  @ViewChild(NewsCardComponent) newsCardComponent?: NewsCardComponent;

  private readonly profileDetailInfoService = inject(ProfileDetailInfoService);
  private readonly profileDetailUIInfoService = inject(ProfileDetailUIInfoService);
  private readonly expandService = inject(ExpandService);
  private readonly newsInfoService = inject(NewsInfoService);

  protected readonly user = this.profileDetailUIInfoService.user;
  protected readonly loggedUserId = this.profileDetailUIInfoService.loggedUserId;
  protected readonly isProfileEmpty = this.profileDetailUIInfoService.isProfileEmpty;

  protected readonly directions = this.profileDetailUIInfoService.directions;
  protected readonly news = this.newsInfoService.news;

  protected readonly descriptionExpandable = this.expandService.descriptionExpandable;
  protected readonly readFullDescription = this.expandService.readFullDescription;

  protected readonly readAllProjects = this.expandService.readAllProjects;
  protected readonly readAllPrograms = this.expandService.readAllPrograms;
  protected readonly readAllAchievements = this.expandService.readAllAchievements;
  protected readonly readAllLinks = this.expandService.readAllLinks;
  protected readonly readAllEducation = this.expandService.readAllEducation;
  protected readonly readAllLanguages = this.expandService.readAllLanguages;
  protected readonly readAllWorkExperience = this.expandService.readAllWorkExperience;

  protected readonly isShowModal = this.profileDetailUIInfoService.isShowModal;

  /**
   * Инициализация компонента
   * Загружает новости пользователя и настраивает Intersection Observer для отслеживания просмотров
   */
  ngOnInit(): void {
    this.profileDetailInfoService.initializationProfile();
  }

  /**
   * Инициализация после создания представления
   * Проверяет необходимость отображения кнопки "Читать полностью" для описания профиля
   */
  ngAfterViewInit(): void {
    this.profileDetailInfoService.initCheckDescription(this.descEl);
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   * Отписывается от всех активных подписок
   */
  ngOnDestroy(): void {
    this.profileDetailInfoService.destroy();
  }

  /**
   * Добавление новой новости в профиль
   * @param news - объект с текстом и файлами новости
   */
  onAddNews(news: { text: string; files: string[] }): void {
    this.profileDetailInfoService.onAddNews(news).subscribe({
      next: () => this.newsFormComponent?.onResetForm(),
    });
  }

  /**
   * Удаление новости из профиля
   * @param newsId - идентификатор удаляемой новости
   */
  onDeleteNews(newsId: number): void {
    this.profileDetailInfoService.onDeleteNews(newsId);
  }

  /**
   * Переключение лайка новости
   * @param newsId - идентификатор новости для лайка/дизлайка
   */
  onLike(newsId: number) {
    this.profileDetailInfoService.onLike(newsId);
  }

  /**
   * Редактирование существующей новости
   * @param news - обновленные данные новости
   * @param newsItemId - идентификатор редактируемой новости
   */
  onEditNews(news: ProfileNews, newsItemId: number) {
    this.profileDetailInfoService.onEditNews(news, newsItemId).subscribe({
      next: () => this.newsCardComponent?.onCloseEditMode(),
    });
  }

  /**
   * Обработчик появления новостей в области видимости
   * Отмечает новости как просмотренные при скролле
   * @param entries - массив элементов, попавших в область видимости
   */
  onNewsInView(entries: IntersectionObserverEntry[]): void {
    this.profileDetailInfoService.onNewsInView(entries);
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

  openWorkInfoModal(): void {
    this.profileDetailUIInfoService.applyOpenWorkInfoModal();
  }
}
