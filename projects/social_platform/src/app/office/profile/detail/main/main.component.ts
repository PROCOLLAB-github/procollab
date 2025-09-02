/** @format */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { User } from "@auth/models/user.model";
import { AuthService } from "@auth/services";
import { expandElement } from "@utils/expand-element";
import { concatMap, map, noop, Observable, of, Subscription, switchMap } from "rxjs";
import { ProfileNewsService } from "../services/profile-news.service";
import { NewsFormComponent } from "@office/shared/news-form/news-form.component";
import { ProfileNews } from "../models/profile-news.model";
import { NewsCardComponent } from "@office/shared/news-card/news-card.component";
import { ParseBreaksPipe, ParseLinksPipe, PluralizePipe } from "projects/core";
import { UserLinksPipe } from "@core/pipes/user-links.pipe";
import { IconComponent } from "@ui/components";
import { TagComponent } from "@ui/components/tag/tag.component";
import { AsyncPipe, NgTemplateOutlet } from "@angular/common";
import { ProfileService } from "@auth/services/profile.service";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { AvatarComponent } from "../../../../ui/components/avatar/avatar.component";
import { Skill } from "@office/models/skill";
import { HttpErrorResponse } from "@angular/common/http";

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
  standalone: true,
  imports: [
    TagComponent,
    NewsFormComponent,
    NewsCardComponent,
    IconComponent,
    ModalComponent,
    AvatarComponent,
    RouterLink,
    NgTemplateOutlet,
    UserLinksPipe,
    ParseBreaksPipe,
    ParseLinksPipe,
    AsyncPipe,
    PluralizePipe,
    AvatarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileMainComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly profileNewsService: ProfileNewsService,
    private readonly profileApproveSkillService: ProfileService,
    private readonly cdRef: ChangeDetectorRef
  ) {}

  subscriptions$: Subscription[] = [];

  user: Observable<User> = this.route.data.pipe(map(r => r["data"][0]));
  loggedUserId: Observable<number> = this.authService.profile.pipe(map(user => user.id));

  /**
   * Инициализация компонента
   * Загружает новости пользователя и настраивает Intersection Observer для отслеживания просмотров
   */
  ngOnInit(): void {
    const route$ = this.route.params
      .pipe(
        map(r => r["id"]),
        concatMap(userId => this.profileNewsService.fetchNews(userId))
      )
      .subscribe(news => {
        this.news.set(news.results);

        setTimeout(() => {
          const observer = new IntersectionObserver(this.onNewsInView.bind(this), {
            root: document.querySelector(".office__body"),
            rootMargin: "0px 0px 0px 0px",
            threshold: 0,
          });
          document.querySelectorAll(".news__item").forEach(e => {
            observer.observe(e);
          });
        });
      });
    this.subscriptions$.push(route$);
  }

  @ViewChild("descEl") descEl?: ElementRef;
  /**
   * Инициализация после создания представления
   * Проверяет необходимость отображения кнопки "Читать полностью" для описания профиля
   */
  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    this.cdRef.detectChanges();
  }

  /**
   * Очистка ресурсов при уничтожении компонента
   * Отписывается от всех активных подписок
   */
  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  descriptionExpandable = false;
  readFullDescription = false;

  readAllProjects = false;
  readAllPrograms = false;
  readAllAchievements = false;
  readAllLinks = false;
  readAllEducation = false;
  readAllLanguages = false;
  readAllWorkExperience = false;
  readAllModal = false;

  approveOwnSkillModal = false;

  @ViewChild(NewsFormComponent) newsFormComponent?: NewsFormComponent;
  @ViewChild(NewsCardComponent) newsCardComponent?: NewsCardComponent;

  news = signal<ProfileNews[]>([]);

  /**
   * Добавление новой новости в профиль
   * @param news - объект с текстом и файлами новости
   */
  onAddNews(news: { text: string; files: string[] }): void {
    this.profileNewsService.addNews(this.route.snapshot.params["id"], news).subscribe(newsRes => {
      this.newsFormComponent?.onResetForm();
      this.news.update(news => [newsRes, ...news]);
    });
  }

  /**
   * Удаление новости из профиля
   * @param newsId - идентификатор удаляемой новости
   */
  onDeleteNews(newsId: number): void {
    const newsIdx = this.news().findIndex(n => n.id === newsId);
    this.news().splice(newsIdx, 1);

    this.profileNewsService.delete(this.route.snapshot.params["id"], newsId).subscribe(() => {});
  }

  /**
   * Переключение лайка новости
   * @param newsId - идентификатор новости для лайка/дизлайка
   */
  onLike(newsId: number) {
    const item = this.news().find(n => n.id === newsId);
    if (!item) return;

    this.profileNewsService
      .toggleLike(this.route.snapshot.params["id"], newsId, !item.isUserLiked)
      .subscribe(() => {
        item.likesCount = item.isUserLiked ? item.likesCount - 1 : item.likesCount + 1;
        item.isUserLiked = !item.isUserLiked;
      });
  }

  /**
   * Редактирование существующей новости
   * @param news - обновленные данные новости
   * @param newsItemId - идентификатор редактируемой новости
   */
  onEditNews(news: ProfileNews, newsItemId: number) {
    this.profileNewsService
      .editNews(this.route.snapshot.params["id"], newsItemId, news)
      .subscribe(resNews => {
        const newsIdx = this.news().findIndex(n => n.id === resNews.id);
        this.news()[newsIdx] = resNews;
        this.newsCardComponent?.onCloseEditMode();
      });
  }

  /**
   * Обработчик появления новостей в области видимости
   * Отмечает новости как просмотренные при скролле
   * @param entries - массив элементов, попавших в область видимости
   */
  onNewsInView(entries: IntersectionObserverEntry[]): void {
    const ids = entries.map(e => {
      return Number((e.target as HTMLElement).dataset["id"]);
    });

    this.profileNewsService.readNews(Number(this.route.snapshot.params["id"]), ids).subscribe(noop);
  }

  /**
   * Раскрытие/сворачивание описания профиля
   * @param elem - DOM элемент описания
   * @param expandedClass - CSS класс для раскрытого состояния
   * @param isExpanded - текущее состояние (раскрыто/свернуто)
   */
  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }

  /**
   * Подтверждение или отмена подтверждения навыка пользователя
   * @param skillId - идентификатор навыка
   * @param event - событие клика для предотвращения всплытия
   * @param skill - объект навыка для обновления
   */
  onToggleApprove(skillId: number, event: Event, skill: Skill, profileId: number) {
    event.stopPropagation();
    const userId = this.route.snapshot.params["id"];

    const isApprovedByCurrentUser = skill.approves.some(approve => {
      return approve.confirmedBy.id === profileId;
    });

    if (isApprovedByCurrentUser) {
      this.profileApproveSkillService.unApproveSkill(userId, skillId).subscribe(() => {
        skill.approves = skill.approves.filter(approve => approve.confirmedBy.id !== profileId);
        this.cdRef.markForCheck();
      });
    } else {
      this.profileApproveSkillService
        .approveSkill(userId, skillId)
        .pipe(
          switchMap(newApprove =>
            newApprove.confirmedBy
              ? of(newApprove)
              : this.authService.profile.pipe(
                  map(profile => ({
                    ...newApprove,
                    confirmedBy: profile,
                  }))
                )
          )
        )
        .subscribe({
          next: updatedApprove => {
            skill.approves = [...skill.approves, updatedApprove];
            this.cdRef.markForCheck();
          },
          error: err => {
            if (err instanceof HttpErrorResponse) {
              if (err.status === 400) {
                this.approveOwnSkillModal = true;
                this.cdRef.markForCheck();
              }
            }
          },
        });
    }
  }

  isUserApproveSkill(skill: Skill, profileId: number): boolean {
    return skill.approves.some(approve => approve.confirmedBy.id === profileId);
  }

  openSkills: any = {};

  /**
   * Открытие модального окна с информацией о подтверждениях навыка
   * @param skillId - идентификатор навыка
   */
  onOpenSkill(skillId: number) {
    this.openSkills[skillId] = !this.openSkills[skillId];
  }

  /**
   * Обработчик изменения состояния модального окна навыка
   * @param event - новое состояние модального окна
   * @param skillId - идентификатор навыка
   */
  onOpenChange(event: boolean, skillId: number) {
    if (this.openSkills[skillId] && !event) {
      this.openSkills[skillId] = false;
    } else {
      this.openSkills[skillId] = event;
    }
  }

  onCloseModal(skillId: number) {
    this.openSkills[skillId] = false;
  }
}
