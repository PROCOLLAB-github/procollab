/** @format */

import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { isLoading } from "projects/social_platform/src/app/domain/shared/async-state";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { SearchComponent } from "@ui/components/search/search.component";
import { ProgramProjectsFilterComponent } from "@ui/components/program-projects-filter/program-projects-filter.component";
import { RatingCardComponent } from "@ui/shared/rating-card/rating-card.component";
import { InfoCardComponent } from "@ui/components/info-card/info-card.component";
import { ButtonComponent } from "@ui/components";
import { IconComponent } from "@uilib";
import { PartnerProgramFields } from "projects/social_platform/src/app/domain/program/partner-program-fields.model";
import { tagsFilter } from "@core/consts/filters/tags-filter.const";
import { ProgramDetailListUIInfoService } from "projects/social_platform/src/app/api/program/facades/detail/ui/program-detail-list-ui-info.service";
import { ProgramDetailListInfoService } from "projects/social_platform/src/app/api/program/facades/detail/program-detail-list-info.service";
import { ExportFileInfoService } from "projects/social_platform/src/app/api/export-file/facades/export-file-info.service";
import { SwipeService } from "projects/social_platform/src/app/api/swipe/swipe.service";
import { ProgramProjectsFilterInfoService } from "@ui/components/program-projects-filter/service/program-projects-filter-info.service";
import { TooltipComponent } from "@ui/components/tooltip/tooltip.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { TooltipInfoService } from "projects/social_platform/src/app/api/tooltip/tooltip-info.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ProgramProjectsFilterComponent,
    SearchComponent,
    RatingCardComponent,
    InfoCardComponent,
    ButtonComponent,
    IconComponent,
    TooltipComponent,
    ModalComponent,
  ],
  providers: [
    ProgramDetailListInfoService,
    ProgramDetailListUIInfoService,
    ProgramProjectsFilterInfoService,
    ExportFileInfoService,
    SwipeService,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramListComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("listRoot") listRoot?: ElementRef<HTMLUListElement>;
  @ViewChild("filterBody") filterBody!: ElementRef<HTMLElement>;

  constructor() {
    this.programDetailListInfoService.initializeSearchForm();
  }

  private readonly programDetailListInfoService = inject(ProgramDetailListInfoService);
  private readonly programDetailListUIInfoService = inject(ProgramDetailListUIInfoService);
  private readonly exportFileInfoService = inject(ExportFileInfoService);
  private readonly tooltipInfoService = inject(TooltipInfoService);
  private readonly swipeService = inject(SwipeService);
  private readonly logger = inject(LoggerService);

  protected readonly searchForm = this.programDetailListUIInfoService.searchForm;

  protected readonly listType = this.programDetailListUIInfoService.listType;
  protected readonly searchedList = this.programDetailListUIInfoService.searchedList;
  protected readonly profileProjSubsIds = this.programDetailListUIInfoService.profileProjSubsIds;

  protected readonly loadingExports = computed(() =>
    isLoading(this.exportFileInfoService.loadingExports$())
  );

  protected readonly isFilterOpen = this.swipeService.isFilterOpen;
  protected readonly ratingOptionsList = tagsFilter;

  protected readonly isHintExpertsVisible = this.tooltipInfoService.isHintExpertsVisible;
  protected readonly isHintExpertsModal = this.programDetailListUIInfoService.isHintExpertsModal;

  ngOnInit(): void {
    this.programDetailListInfoService.initializationListData();
  }

  ngAfterViewInit(): void {
    const target = document.querySelector(".office__body") as HTMLElement;
    if (target || this.listRoot) {
      this.programDetailListInfoService.initScroll(target, this.listRoot!);
    } else {
      this.logger.error(".office__body element not found");
    }
  }

  ngOnDestroy(): void {
    this.programDetailListInfoService.destroy();
  }

  routerLink(linkId: number): string {
    return this.programDetailListUIInfoService.routerLink(linkId);
  }

  onFiltersLoaded(filters: PartnerProgramFields[]): void {
    this.programDetailListUIInfoService.applySetAvailableFilters(filters);
  }

  downloadProjects(): void {
    this.exportFileInfoService.downloadProjects();
  }

  downloadSubmittedProjects(): void {
    this.exportFileInfoService.downloadSubmittedProjects();
  }

  downloadRates(): void {
    this.exportFileInfoService.downloadRates();
  }

  downloadCalculations(): void {}

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

  openHintModal(event: Event): void {
    event.preventDefault();
    this.tooltipInfoService.hideTooltip("experts");
    this.programDetailListUIInfoService.applyHintModalOpen();
  }

  /**
   * Сброс всех активных фильтров
   * Очищает все query параметры и возвращает к состоянию по умолчанию
   */
  onClearFilters(): void {
    this.programDetailListInfoService.onClearFilters();
  }
}
