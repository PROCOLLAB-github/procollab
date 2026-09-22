/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  viewChild,
  ViewChild,
} from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { SearchComponent } from "@ui/primitives/search/search.component";
import { ButtonComponent } from "@ui/primitives/button/button.component";
import { IconComponent } from "@ui/primitives/icon/icon.component";
import { BarNewComponent } from "./bar-new/bar.component";
import { BackComponent } from "@uilib";
import { InfoCardComponent } from "@ui/widgets/info-card/info-card.component";
import { ProjectsUIInfoService } from "@api/project/facades/ui/projects-ui-info.service";
import { ProjectsInfoService } from "@api/project/facades/projects-info.service";
import { SwipeService } from "@api/swipe/swipe.service";
import { ProjectsFilterComponent } from "@ui/widgets/projects-filter/projects-filter.component";
import { OfficeInfoService } from "@api/office/facades/office-info.service";
import { ProjectActivityCardComponent } from "./project-activity-card/project-activity-card.component";

/** Контейнер модуля проектов с поиском, фильтрацией и навигацией по разделам. */
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
    ProjectActivityCardComponent,
    ProjectsFilterComponent,
    InfoCardComponent,
  ],
  providers: [ProjectsInfoService, ProjectsUIInfoService, SwipeService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent implements OnInit {
  readonly filterBody = viewChild<ElementRef<HTMLElement>>("filterBody");

  private readonly projectsInfoService = inject(ProjectsInfoService);
  private readonly projectsUIInfoService = inject(ProjectsUIInfoService);
  private readonly officeInfoService = inject(OfficeInfoService);
  private readonly swipeService = inject(SwipeService);

  ngOnInit(): void {
    this.projectsInfoService.initializationProjects();
  }

  protected readonly searchForm = this.projectsUIInfoService.searchForm;

  protected readonly myInvites = this.projectsUIInfoService.myInvites;

  protected readonly isMy = this.projectsInfoService.isMy;
  protected readonly isAll = this.projectsInfoService.isAll;
  protected readonly isSubs = this.projectsInfoService.isSubs;
  protected readonly isInvites = this.projectsInfoService.isInvites;
  protected readonly isDashboard = this.projectsInfoService.isDashboard;
  protected readonly projectCount = this.projectsInfoService.projectCount;
  protected readonly projectCountState = this.projectsInfoService.projectCountState;

  protected readonly isFilterOpen = this.swipeService.isFilterOpen;

  onSwipeStart(event: TouchEvent): void {
    this.swipeService.onSwipeStart(event);
  }

  onSwipeMove(event: TouchEvent): void {
    this.swipeService.onSwipeMove(event, this.filterBody()!);
  }

  onSwipeEnd(event: TouchEvent): void {
    this.swipeService.onSwipeEnd(event, this.filterBody()!);
  }

  closeFilter(): void {
    this.swipeService.closeFilter();
  }

  addProject(): void {
    this.projectsInfoService.addProject();
  }

  onAcceptInvite(inviteId: number): void {
    this.officeInfoService.onAcceptInvite(inviteId);
  }

  onRejectInvite(inviteId: number): void {
    this.officeInfoService.onRejectInvite(inviteId);
  }
}
