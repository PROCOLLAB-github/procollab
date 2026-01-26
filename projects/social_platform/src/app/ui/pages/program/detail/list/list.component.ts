/** @format */

import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { SearchComponent } from "@ui/components/search/search.component";
import { ProgramProjectsFilterComponent } from "@ui/components/program-projects-filter/program-projects-filter.component";
import { RatingCardComponent } from "@ui/shared/rating-card/rating-card.component";
import { InfoCardComponent } from "@ui/components/info-card/info-card.component";
import { ButtonComponent } from "@ui/components";
import { IconComponent } from "@uilib";
import { PartnerProgramFields } from "projects/social_platform/src/app/domain/program/partner-program-fields.model";
import { tagsFilter } from "projects/core/src/consts/filters/tags-filter.const";
import { ProgramDetailListUIInfoService } from "projects/social_platform/src/app/api/program/facades/detail/ui/program-detail-list-ui-info.service";
import { ProgramDetailListInfoService } from "projects/social_platform/src/app/api/program/facades/detail/program-detail-list-info.service";
import { ExportFileInfoService } from "projects/social_platform/src/app/api/export-file/facades/export-file-info.service";
import { SwipeService } from "projects/social_platform/src/app/api/swipe/swipe.service";

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
  ],
  providers: [
    ProgramDetailListInfoService,
    ProgramDetailListUIInfoService,
    ExportFileInfoService,
    SwipeService,
  ],
  standalone: true,
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
  private readonly swipeService = inject(SwipeService);

  protected readonly searchForm = this.programDetailListUIInfoService.searchForm;

  protected readonly listType = this.programDetailListUIInfoService.listType;
  protected readonly searchedList = this.programDetailListUIInfoService.searchedList;
  protected readonly profileProjSubsIds = this.programDetailListUIInfoService.profileProjSubsIds;

  protected readonly loadingExportProjects = this.exportFileInfoService.loadingExportProjects;
  protected readonly loadingExportSubmittedProjects =
    this.exportFileInfoService.loadingExportSubmittedProjects;
  protected readonly loadingExportRates = this.exportFileInfoService.loadingExportRates;
  protected readonly loadingExportCalculations =
    this.exportFileInfoService.loadingExportCalculations;

  protected readonly isFilterOpen = this.swipeService.isFilterOpen;
  protected readonly ratingOptionsList = tagsFilter;

  ngOnInit(): void {
    this.programDetailListInfoService.initializationListData();
  }

  ngAfterViewInit(): void {
    const target = document.querySelector(".office__body") as HTMLElement;
    if (target || this.listRoot) {
      this.programDetailListInfoService.initScroll(target, this.listRoot!);
    } else {
      console.error(".office__body element not found");
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

  /**
   * Сброс всех активных фильтров
   * Очищает все query параметры и возвращает к состоянию по умолчанию
   */
  onClearFilters(): void {
    this.programDetailListInfoService.onClearFilters();
  }
}
