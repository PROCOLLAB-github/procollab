/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, Input, ViewChild, WritableSignal } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { IconComponent, ButtonComponent } from "@ui/components";
import { NewsCardComponent } from "@ui/components/news-card/news-card.component";
import { NewsFormComponent } from "@ui/components/news-form/news-form.component";
import { ProjectDirectionCard } from "@ui/shared/project-direction-card/project-direction-card.component";
import { ExpandService } from "projects/social_platform/src/app/api/expand/expand.service";
import { NewsInfoService } from "projects/social_platform/src/app/api/news/news-info.service";
import { ProfileDetailInfoService } from "projects/social_platform/src/app/api/profile/facades/detail/profile-detail-info.service";
import { ProfileDetailUIInfoService } from "projects/social_platform/src/app/api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { User } from "projects/social_platform/src/app/domain/auth/user.model";
import { ProfileNews } from "projects/social_platform/src/app/domain/profile/profile-news.model";

@Component({
  selector: "app-profile-mid-side",
  templateUrl: "./profile-mid-side.component.html",
  styleUrl: "./profile-mid-side.component.scss",
  imports: [
    CommonModule,
    IconComponent,
    RouterModule,
    NewsCardComponent,
    ButtonComponent,
    NewsFormComponent,
    ProjectDirectionCard,
    ParseLinksPipe,
    ParseBreaksPipe,
  ],
  standalone: true,
})
export class ProfileMidSideComponent {
  @ViewChild(NewsFormComponent) newsFormComponent?: NewsFormComponent;
  @ViewChild(NewsCardComponent) newsCardComponent?: NewsCardComponent;

  @Input() user!: WritableSignal<User | undefined>;

  private readonly profileDetailInfoService = inject(ProfileDetailInfoService);
  private readonly profileDetailUIInfoService = inject(ProfileDetailUIInfoService);
  private readonly newsInfoService = inject(NewsInfoService);
  private readonly expandService = inject(ExpandService);

  protected readonly loggedUserId = this.profileDetailUIInfoService.loggedUserId;
  protected readonly isProfileEmpty = this.profileDetailUIInfoService.isProfileEmpty;

  protected readonly directions = this.profileDetailUIInfoService.directions;
  protected readonly news = this.newsInfoService.news;

  protected readonly descriptionExpandable = this.expandService.descriptionExpandable;
  protected readonly readFullDescription = this.expandService.readFullDescription;

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
}
