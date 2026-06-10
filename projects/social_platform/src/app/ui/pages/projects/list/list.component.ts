/** @format */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  viewChild,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { IconComponent } from "@ui/primitives";
import { InfoCardComponent } from "@ui/widgets/info-card/info-card.component";
import { ProjectsListInfoService } from "@api/project/facades/list/projects-list-info.service";
import { SwipeService } from "@api/swipe/swipe.service";
import { ProjectsInfoService } from "@api/project/facades/projects-info.service";
import { OfficeInfoService } from "@api/office/facades/office-info.service";
import { ProgramDetailListUIInfoService } from "@api/program/facades/detail/ui/program-detail-list-ui-info.service";
import { ProgramDetailListInfoService } from "@api/program/facades/detail/program-detail-list-info.service";
import { OfficeUIInfoService } from "@api/office/facades/ui/office-ui-info.service";
import { AppRoutes } from "@api/paths/app-routes";

/** Отображает список проектов с поиском, фильтрацией и бесконечной прокруткой. */
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsListComponent implements OnInit, AfterViewInit {
  readonly filterBody = viewChild<ElementRef<HTMLElement>>("filterBody");
  readonly listRoot = viewChild<ElementRef<HTMLUListElement>>("listRoot");

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

  protected readonly AppRoutes = AppRoutes;

  ngOnInit(): void {
    this.projectsListInfoService.initializationProjectsList();
  }

  ngAfterViewInit(): void {
    const target = document.querySelector(".office__body") as HTMLElement;
    if (target || this.listRoot()) {
      this.projectsListInfoService.initScroll(target, this.listRoot()!);
    }
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
    this.swipeService.onSwipeMove(event, this.filterBody()!);
  }

  onSwipeEnd(event: TouchEvent): void {
    this.swipeService.onSwipeEnd(event, this.filterBody()!);
  }

  closeFilter(): void {
    this.swipeService.closeFilter();
  }
}
