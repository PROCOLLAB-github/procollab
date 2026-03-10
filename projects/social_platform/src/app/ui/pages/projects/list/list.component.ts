/** @format */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { IconComponent } from "@ui/components";
import { InfoCardComponent } from "@ui/components/info-card/info-card.component";
import { ProjectsListInfoService } from "projects/social_platform/src/app/api/project/facades/list/projects-list-info.service";
import { SwipeService } from "projects/social_platform/src/app/api/swipe/swipe.service";
import { ProjectsInfoService } from "projects/social_platform/src/app/api/project/facades/projects-info.service";
import { OfficeInfoService } from "projects/social_platform/src/app/api/office/facades/office-info.service";
import { ProgramDetailListUIInfoService } from "projects/social_platform/src/app/api/program/facades/detail/ui/program-detail-list-ui-info.service";
import { ProgramDetailListInfoService } from "projects/social_platform/src/app/api/program/facades/detail/program-detail-list-info.service";
import { OfficeUIInfoService } from "projects/social_platform/src/app/api/office/facades/ui/office-ui-info.service";

/**
 * КОМПОНЕНТ СПИСКА ПРОЕКТОВ
 *
 * Назначение:
 * - Отображает список проектов в различных режимах (все/мои/подписки)
 * - Реализует функциональность поиска и фильтрации проектов
 * - Обеспечивает бесконечную прокрутку для загрузки дополнительных проектов
 * - Управляет состоянием фильтров на мобильных устройствах
 *
 * 1. Отображение проектов в виде карточек
 * 2. Поиск по названию проекта (используя библиотеку Fuse.js)
 * 3. Фильтрация по различным критериям (индустрия, этап, количество участников и т.д.)
 * 4. Создание и удаление проектов
 * 5. Подписка/отписка от проектов
 * 6. Адаптивный интерфейс с поддержкой свайпов на мобильных
 *
 * @param:
 * - Данные маршрута (route.data) - предзагруженные проекты через резолверы
 * - Параметры запроса (route.queryParams) - фильтры и поисковый запрос
 * - Профиль пользователя (authService.profile)
 * - Подписки пользователя (subscriptionService)
 *
 * @return
 * - Отображение списка проектов
 * - Навигация к детальной странице проекта
 * - Создание нового проекта
 * - Удаление проекта (только для владельца)
 *
 * Состояние компонента:
 * - projects[] - полный список проектов
 * - searchedProjects[] - отфильтрованный список для отображения
 * - profile - данные текущего пользователя
 * - isFilterOpen - состояние панели фильтров (мобильные)
 * - isAll/isMy/isSubs/isInvites - флаги текущего режима просмотра
 *
 * Жизненный цикл:
 * - OnInit: настройка подписок, инициализация данных
 * - AfterViewInit: настройка обработчика прокрутки
 * - OnDestroy: отписка от всех подписок
 *
 * - Использует RxJS для реактивного программирования
 * - Реализует паттерн "бесконечная прокрутка" для оптимизации производительности
 * - Поддерживает жесты свайпа для закрытия фильтров на мобильных
 * - Использует Fuse.js для нечеткого поиска по названиям проектов
 * - Кэширует запросы фильтрации для избежания дублирующих HTTP-запросов
 */
@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
  imports: [IconComponent, RouterLink, InfoCardComponent],
  providers: [
    ProjectsListInfoService,
    ProjectsInfoService,
    ProgramDetailListInfoService,
    ProgramDetailListUIInfoService,
    OfficeInfoService,
    OfficeUIInfoService,
    SwipeService,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("filterBody") filterBody!: ElementRef<HTMLElement>;
  @ViewChild("listRoot") listRoot?: ElementRef<HTMLUListElement>;

  private readonly projectsListInfoService = inject(ProjectsListInfoService);
  private readonly projectsInfoService = inject(ProjectsInfoService);
  private readonly programDetailListUIInfoService = inject(ProgramDetailListUIInfoService);
  private readonly officeInfoService = inject(OfficeInfoService);
  private readonly swipeService = inject(SwipeService);

  protected readonly isFilterOpen = this.swipeService.isFilterOpen;

  protected readonly projects = this.projectsListInfoService.projects;
  protected readonly profileProjSubsIds = this.programDetailListUIInfoService.profileProjSubsIds;

  protected readonly isAll = this.projectsInfoService.isAll;
  protected readonly isMy = this.projectsInfoService.isMy;
  protected readonly isSubs = this.projectsInfoService.isSubs;
  protected readonly isInvites = this.projectsInfoService.isInvites;

  ngOnInit(): void {
    this.projectsListInfoService.initializationProjectsList();
  }

  ngAfterViewInit(): void {
    const target = document.querySelector(".office__body") as HTMLElement;
    if (target || this.listRoot) {
      this.projectsListInfoService.initScroll(target, this.listRoot!);
    }
  }

  ngOnDestroy(): void {
    this.projectsListInfoService.destroy();
  }

  onAcceptInvite(event: number): void {
    this.officeInfoService.onAcceptInvite(event);
  }

  onRejectInvite(event: number): void {
    this.officeInfoService.onRejectInvite(event);
  }

  onSwipeStart(event: TouchEvent): void {
    this.swipeService.onSwipeStart(event);
  }

  onSwipeMove(event: TouchEvent): void {
    this.swipeService.onSwipeMove(event, this.filterBody);
  }

  onSwipeEnd(event: TouchEvent): void {
    this.swipeService.onSwipeEnd(event, this.filterBody);
  }

  closeFilter(): void {
    this.swipeService.closeFilter();
  }
}
