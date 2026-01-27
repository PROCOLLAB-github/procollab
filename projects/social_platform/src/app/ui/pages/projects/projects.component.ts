/** @format */

import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { SearchComponent } from "@ui/components/search/search.component";
import { ButtonComponent, IconComponent } from "@ui/components";
import { BarNewComponent } from "@ui/components/bar-new/bar.component";
import { BackComponent } from "@uilib";
import { SoonCardComponent } from "@ui/shared/soon-card/soon-card.component";
import { ProjectsFilterComponent } from "../../components/projects-filter/projects-filter.component";
import { InfoCardComponent } from "@ui/components/info-card/info-card.component";
import { ProjectsUIInfoService } from "../../../api/project/facades/ui/projects-ui-info.service";
import { ProjectsInfoService } from "../../../api/project/facades/projects-info.service";
import { SwipeService } from "../../../api/swipe/swipe.service";

/**
 * Главный компонент модуля проектов
 * Управляет отображением списка проектов, поиском и созданием новых проектов
 *
 * Принимает:
 * - Счетчики проектов через резолвер
 * - Параметры поиска из URL
 *
 * Возвращает:
 * - Интерфейс управления проектами с поиском и фильтрацией
 * - Навигацию между разделами "Мои", "Все", "Подписки"
 */
@Component({
  selector: "app-projects",
  templateUrl: "./projects.component.html",
  styleUrl: "./projects.component.scss",
  imports: [
    IconComponent,
    ReactiveFormsModule,
    SearchComponent,
    ButtonComponent,
    RouterOutlet,
    BarNewComponent,
    BackComponent,
    SoonCardComponent,
    ProjectsFilterComponent,
    InfoCardComponent,
  ],
  providers: [ProjectsInfoService, ProjectsUIInfoService, SwipeService],
  standalone: true,
})
export class ProjectsComponent implements OnInit, OnDestroy {
  @ViewChild("filterBody") filterBody!: ElementRef<HTMLElement>;

  private readonly projectsInfoService = inject(ProjectsInfoService);
  private readonly projectsUIInfoService = inject(ProjectsUIInfoService);
  private readonly swipeService = inject(SwipeService);

  ngOnInit(): void {
    this.projectsInfoService.initializationProjects();
  }

  ngOnDestroy(): void {
    this.projectsInfoService.destroy();
  }

  protected readonly searchForm = this.projectsUIInfoService.searchForm;

  protected readonly myInvites = this.projectsUIInfoService.myInvites;

  protected readonly isMy = this.projectsInfoService.isMy;
  protected readonly isAll = this.projectsInfoService.isAll;
  protected readonly isSubs = this.projectsInfoService.isSubs;
  protected readonly isInvites = this.projectsInfoService.isInvites;
  protected readonly isDashboard = this.projectsInfoService.isDashboard;

  protected readonly isFilterOpen = this.swipeService.isFilterOpen;

  onSwipeStart(event: TouchEvent): void {
    this.swipeService.onSwipeStart(event);
  }

  onSwipeMove(event: TouchEvent): void {
    this.swipeService.onSwipeMove(event, this.filterBody);
  }

  onSwipeEnd(event: TouchEvent): void {
    this.swipeService.onSwipeEnd(event, this.filterBody);
  }

  acceptOrRejectInvite(inviteId: number): void {
    this.projectsUIInfoService.applyAcceptOrRejectInvite(inviteId);
  }

  closeFilter(): void {
    this.swipeService.closeFilter();
  }

  addProject(): void {
    this.projectsInfoService.addProject();
  }
}
