/** @format */

import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  viewChild,
  ViewChild,
} from "@angular/core";
import { isLoading } from "@domain/shared/async-state";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { SearchComponent } from "@ui/primitives/search/search.component";
import { ProgramProjectsFilterComponent } from "./program-projects-filter/program-projects-filter.component";
import { RatingCardComponent } from "./rating-card/rating-card.component";
import { InfoCardComponent } from "@ui/widgets/info-card/info-card.component";
import { ButtonComponent } from "@ui/primitives";
import { IconComponent } from "@uilib";
import { PartnerProgramFields } from "@domain/program/partner-program-fields.model";
import { tagsFilter } from "@core/consts/filters/tags-filter.const";
import { ProgramDetailListUIInfoService } from "@api/program/facades/detail/ui/program-detail-list-ui-info.service";
import { ProgramDetailListInfoService } from "@api/program/facades/detail/program-detail-list-info.service";
import { ExportFileInfoService } from "@api/export-file/facades/export-file-info.service";
import { SwipeService } from "@api/swipe/swipe.service";
import { ProgramProjectsFilterInfoService } from "./program-projects-filter/service/program-projects-filter-info.service";
import { TooltipComponent } from "@ui/primitives/tooltip/tooltip.component";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { TooltipInfoService } from "@api/tooltip/tooltip-info.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";

/** Вкладка списка программы: проекты/участники с фильтрами. */
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
    TooltipInfoService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramListComponent implements OnInit, AfterViewInit {
  readonly listRoot = viewChild<ElementRef<HTMLUListElement> | undefined>("listRoot");
  readonly filterBody = viewChild<ElementRef<HTMLElement>>("filterBody");

  constructor() {
    this.programDetailListInfoService.initializeSearchForm();
  }

  private readonly programDetailListInfoService = inject(ProgramDetailListInfoService);
  private readonly programDetailListUIInfoService = inject(ProgramDetailListUIInfoService);
  private readonly programProjectsFilterInfoService = inject(ProgramProjectsFilterInfoService);
  private readonly exportFileInfoService = inject(ExportFileInfoService);
  protected readonly tooltipInfoService = inject(TooltipInfoService);
  private readonly swipeService = inject(SwipeService);
  private readonly logger = inject(LoggerService);

  protected readonly searchForm = this.programDetailListUIInfoService.searchForm;

  protected readonly listType = this.programDetailListUIInfoService.listType;
  protected readonly searchedList = this.programDetailListUIInfoService.searchedList;
  protected readonly profileProjSubsIds = this.programDetailListUIInfoService.profileProjSubsIds;

  protected readonly loadingExports = computed(() =>
    isLoading(this.exportFileInfoService.loadingExports$()),
  );

  protected readonly isFilterOpen = this.swipeService.isFilterOpen;
  protected readonly ratingOptionsList = tagsFilter;

  protected readonly isHintExpertsModal = this.programDetailListUIInfoService.isHintExpertsModal;

  protected appWidth = window.innerWidth;

  @HostListener("window:resize")
  onResize() {
    this.appWidth = window.innerWidth;
  }

  ngOnInit(): void {
    this.programDetailListInfoService.initializationListData();
    this.programProjectsFilterInfoService.initializationProgramProjectsFilter();
  }

  ngAfterViewInit(): void {
    const target = document.querySelector(".office__body") as HTMLElement;
    if (target || this.listRoot()) {
      this.programDetailListInfoService.initScroll(target, this.listRoot()!);
    } else {
      this.logger.error(".office__body element not found");
    }
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
    this.swipeService.onSwipeMove(event, this.filterBody()!);
  }

  onSwipeEnd(event: TouchEvent): void {
    this.swipeService.onSwipeEnd(event, this.filterBody()!);
  }

  closeFilter(): void {
    this.swipeService.closeFilter();
  }

  openHintModal(event: Event): void {
    event.preventDefault();
    this.tooltipInfoService.toggleTooltip("hint-experts");
    this.programDetailListUIInfoService.applyHintModalOpen();
  }

  /**
   * Сброс всех активных фильтров. Делегируем в filter-сервис, который полностью очищает
   * query (navigateByUrl на pathname без query). Mobile-кнопка "сбросить" и (clear) от
   * filter-component используют один и тот же путь — гонок navigate'ов нет.
   */
  onClearFilters(): void {
    this.programProjectsFilterInfoService.clearFilters();
  }
}
