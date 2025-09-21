/** @format */

import { AsyncPipe, CommonModule, NgTemplateOutlet } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from "@angular/router";
import { User } from "@auth/models/user.model";
import { AuthService } from "@auth/services";
import { UserLinksPipe } from "@core/pipes/user-links.pipe";
import { Project } from "@models/project.model";
import { Vacancy } from "@models/vacancy.model";
import { Collaborator } from "@office/models/collaborator.model";
import { ProjectNewsService } from "@office/projects/detail/services/project-news.service";
import { FeedNews } from "@office/projects/models/project-news.model";
import { ProjectService } from "@office/services/project.service";
import { NewsCardComponent } from "@office/shared/news-card/news-card.component";
import { NewsFormComponent } from "@office/shared/news-form/news-form.component";
import { IndustryService } from "@services/industry.service";
import { NavService } from "@services/nav.service";
import { ButtonComponent, IconComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { expandElement } from "@utils/expand-element";
import { containerSm } from "@utils/responsive";
import { ParseBreaksPipe, ParseLinksPipe } from "projects/core";
import {
  Observable,
  Subscription,
  concatMap,
  forkJoin,
  map,
  noop,
  of,
  switchMap,
  take,
} from "rxjs";
import { ProjectMemberCardComponent } from "../shared/project-member-card/project-member-card.component";
import { EditorSubmitButtonDirective } from "@ui/directives/editor-submit-button.directive";
import { DirectionItem, directionItemBuilder } from "@utils/helpers/directionItemBuilder";
import { ProjectDirectionCard } from "../shared/project-direction-card/project-direction-card.component";

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
    AvatarComponent,
    RouterOutlet,
    RouterLink,
    ButtonComponent,
    IconComponent,
    ModalComponent,
    NgTemplateOutlet,
    AsyncPipe,
    ProjectMemberCardComponent,
    RouterOutlet,
    UserLinksPipe,
    ParseBreaksPipe,
    ParseLinksPipe,
    NewsFormComponent,
    NewsCardComponent,
    CommonModule,
    ProjectDirectionCard,
  ],
})
export class ProjectInfoComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute, // Сервис для работы с активным маршрутом
    private readonly router: Router, // Сервис для навигации
    public readonly industryService: IndustryService, // Сервис сфер проекта
    public readonly authService: AuthService, // Сервис аутентификации
    private readonly navService: NavService, // Сервис навигации
    private readonly projectNewsService: ProjectNewsService, // Сервис новостей проекта
    private readonly projectService: ProjectService, // Сервис проектов
    private readonly cdRef: ChangeDetectorRef // Сервис для ручного запуска обнаружения изменений
  ) {}

  // Observable с подписчиками проекта
  projSubscribers$?: Observable<User[]> = this.route.parent?.data.pipe(map(r => r["data"][1]));

  profileId!: number; // ID текущего пользователя

  subscriptions$: Subscription[] = []; // Массив подписок для очистки

  /**
   * Инициализация компонента
   * Устанавливает заголовок навигации, загружает новости, определяет статус подписки
   */
  ngOnInit(): void {
    this.navService.setNavTitle("Профиль проекта");

    const projectSub$ =
      this.route.parent?.data
        .pipe(
          map(r => r["data"][0]),
          switchMap(project => {
            return this.authService.getUser(project.leader).pipe(
              map(user => {
                return {
                  ...project,
                  leaderInfo: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                  },
                };
              })
            );
          })
        )
        .subscribe({
          next: (project: Project) => {
            this.project = project;

            if (project) {
              this.directions = directionItemBuilder(
                5,
                ["проблема", "целевая аудитория", "актуаль-сть", "цели", "партнеры"],
                ["key", "smile", "graph", "goal", "team"],
                [
                  this.project?.problem,
                  this.project?.targetAudience,
                  this.project?.actuality,
                  "",
                  "",
                ]
              )!;
            }

            setTimeout(() => {
              this.checkDescriptionExpandable();
              this.cdRef.detectChanges();
            }, 0);
          },
        }) ?? Subscription.EMPTY;

    // Загрузка новостей проекта
    const news$ = this.projectNewsService
      .fetchNews(this.route.snapshot.params["projectId"])
      .subscribe(news => {
        this.news = news.results;

        // Настройка наблюдателя для отслеживания просмотра новостей
        setTimeout(() => {
          const observer = new IntersectionObserver(this.onNewsInVew.bind(this), {
            root: document.querySelector(".office__body"),
            rootMargin: "0px 0px 0px 0px",
            threshold: 0,
          });
          document.querySelectorAll(".news__item").forEach(e => {
            observer.observe(e);
          });
        });
      });

    // Получение ID текущего пользователя
    const profileId$ = this.authService.profile.subscribe(profile => {
      this.profileId = profile.id;
    });

    this.subscriptions$.push(projectSub$, news$, profileId$);
  }

  // Ссылки на элементы DOM
  @ViewChild("newsEl") newsEl?: ElementRef;
  @ViewChild("contentEl") contentEl?: ElementRef;
  @ViewChild("descEl") descEl?: ElementRef;

  /**
   * Хук после инициализации представления
   * Перемещает новости в контентную область на десктопе, проверяет необходимость кнопки "Читать полностью"
   */
  ngAfterViewInit(): void {
    if (containerSm < window.innerWidth) {
      this.contentEl?.nativeElement.append(this.newsEl?.nativeElement);
    }
  }

  /**
   * Очистка подписок при уничтожении компонента
   */
  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  /**
   * Обработчик появления новостей в области видимости
   * Отмечает новости как просмотренные
   * @param entries - массив элементов, попавших в область видимости
   */
  onNewsInVew(entries: IntersectionObserverEntry[]): void {
    const ids = entries.map(e => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return e.target.dataset.id;
    });

    this.projectNewsService
      .readNews(Number(this.route.snapshot.params["projectId"]), ids)
      .subscribe(noop);
  }

  // Ссылки на дочерние компоненты
  @ViewChild(NewsFormComponent) newsFormComponent?: NewsFormComponent;
  @ViewChild(NewsCardComponent) newsCardComponent?: NewsCardComponent;

  // Состояние компонента
  news: FeedNews[] = []; // Массив новостей
  readFullDescription = false; // Флаг развернутого описания
  descriptionExpandable!: boolean; // Флаг необходимости кнопки "Читать полностью"
  readAllAchievements = false; // Флаг показа всех достижений
  readAllVacancies = false; // Флаг показа всех вакансий
  readAllMembers = false; // Флаг показа всех участников
  isCompleted = false; // Флаг завершенности проекта

  // Данные о проекте
  project?: Project;

  directions: DirectionItem[] = [];

  /**
   * Добавление новой новости
   * @param news - объект с текстом и файлами новости
   */
  onAddNews(news: { text: string; files: string[] }): void {
    this.projectNewsService
      .addNews(this.route.snapshot.params["projectId"], news)
      .subscribe(newsRes => {
        this.newsFormComponent?.onResetForm();
        this.news.unshift(newsRes);
      });
  }

  /**
   * Удаление новости
   * @param newsId - ID удаляемой новости
   */
  onDeleteNews(newsId: number): void {
    const newsIdx = this.news.findIndex(n => n.id === newsId);
    this.news.splice(newsIdx, 1);

    this.projectNewsService
      .delete(this.route.snapshot.params["projectId"], newsId)
      .subscribe(() => {});
  }

  /**
   * Переключение лайка новости
   * @param newsId - ID новости для лайка
   */
  onLike(newsId: number) {
    const item = this.news.find(n => n.id === newsId);
    if (!item) return;

    this.projectNewsService
      .toggleLike(this.route.snapshot.params["projectId"], newsId, !item.isUserLiked)
      .subscribe(() => {
        item.likesCount = item.isUserLiked ? item.likesCount - 1 : item.likesCount + 1;
        item.isUserLiked = !item.isUserLiked;
      });
  }

  /**
   * Редактирование новости
   * @param news - обновленные данные новости
   * @param newsItemId - ID редактируемой новости
   */
  onEditNews(news: FeedNews, newsItemId: number) {
    this.projectNewsService
      .editNews(this.route.snapshot.params["projectId"], newsItemId, news)
      .subscribe(resNews => {
        const newsIdx = this.news.findIndex(n => n.id === resNews.id);
        this.news[newsIdx] = resNews;
        this.newsCardComponent?.onCloseEditMode();
      });
  }

  /**
   * Удаление участника из проекта
   * @param id - ID удаляемого участника
   */
  onRemoveMember(id: Collaborator["userId"]) {
    this.projectService
      .removeColloborator(this.route.snapshot.params["projectId"], id)
      .subscribe(() => {
        location.reload();
      });
  }

  /**
   * Передача лидерства другому участнику
   * @param id - ID нового лидера
   */
  onTransferOwnership(id: Collaborator["userId"]) {
    this.projectService.switchLeader(this.route.snapshot.params["projectId"], id).subscribe(() => {
      location.reload();
    });
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
   * Получение названий навыков для вакансии
   * @param vacancy - объект вакансии
   * @returns строка с названиями навыков, разделенными точками
   */
  getSkillsNames(vacancy: Vacancy) {
    return vacancy.requiredSkills.map((s: any) => s.name).join(" • ");
  }

  private checkDescriptionExpandable(): void {
    const descElement = this.descEl?.nativeElement;

    if (!descElement || !this.project?.description) {
      this.descriptionExpandable = false;
      return;
    }

    this.descriptionExpandable = descElement.scrollHeight > descElement.clientHeight;
  }
}
