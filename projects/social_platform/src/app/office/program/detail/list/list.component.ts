/** @format */

import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  signal,
} from "@angular/core";
import {
  catchError,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  map,
  noop,
  of,
  Subscription,
  switchMap,
  tap,
} from "rxjs";
import { ProjectsFilterComponent } from "@office/program/detail/list/projects-filter/projects-filter.component";
import Fuse from "fuse.js";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { SearchComponent } from "@ui/components/search/search.component";
import { User } from "@auth/models/user.model";
import { Project } from "@office/models/project.model";
import { RatingCardComponent } from "@office/program/shared/rating-card/rating-card.component";
import { ProgramService } from "@office/program/services/program.service";
import { ProjectRatingService } from "@office/program/services/project-rating.service";
import { AuthService } from "@auth/services";
import { SubscriptionService } from "@office/services/subscription.service";
import { ApiPagination } from "@models/api-pagination.model";
import { HttpParams } from "@angular/common/http";
import { PartnerProgramFields } from "@office/models/partner-program-fields.model";
import { CheckboxComponent, ButtonComponent, IconComponent } from "@ui/components";
import { InfoCardComponent } from "@office/features/info-card/info-card.component";
import { tagsFilter } from "projects/core/src/consts/filters/tags-filter.const";
import { ExportFileService } from "@office/services/export-file.service";
import { saveFile } from "@utils/helpers/export-file";
import { ProgramDataService } from "@office/program/services/program-data.service";
import { TooltipComponent } from "@ui/components/tooltip/tooltip.component";
import { ModalComponent } from "@ui/components/modal/modal.component";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ProjectsFilterComponent,
    SearchComponent,
    RatingCardComponent,
    InfoCardComponent,
    ButtonComponent,
    IconComponent,
    TooltipComponent,
    ModalComponent,
  ],
  standalone: true,
})
export class ProgramListComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor() {
    const searchValue =
      this.route.snapshot.queryParams["search"] ||
      this.route.snapshot.queryParams["name__contains"];
    const decodedSearchValue = searchValue ? decodeURIComponent(searchValue) : "";

    this.searchForm = this.fb.group({
      search: [decodedSearchValue],
    });
  }

  @ViewChild("listRoot") listRoot?: ElementRef<HTMLUListElement>;
  @ViewChild("filterBody") filterBody!: ElementRef<HTMLElement>;

  private readonly renderer = inject(Renderer2);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdref = inject(ChangeDetectorRef);
  private readonly programService = inject(ProgramService);
  private readonly programDataService = inject(ProgramDataService);
  private readonly projectRatingService = inject(ProjectRatingService);
  private readonly authService = inject(AuthService);
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly exportFileService = inject(ExportFileService);

  protected availableFilters: PartnerProgramFields[] = [];

  searchForm: FormGroup;

  listTotalCount?: number;
  listPage = 0;
  listTake = 20;
  perPage = 21;

  list: any[] = [];
  searchedList: any[] = [];
  profile?: User;
  profileProjSubsIds?: number[];

  isRatedByExpert = signal<boolean | undefined>(undefined);
  searchValue = signal<string>("");

  listType: "projects" | "members" | "rating" = "projects";

  readonly ratingOptionsList = tagsFilter;
  isFilterOpen = false;

  readonly isHintExpertsVisible = signal<boolean>(false);
  readonly isHintExpertsModal = signal<boolean>(false);

  protected readonly loadingExportProjects = signal<boolean>(false);
  protected readonly loadingExportSubmittedProjects = signal<boolean>(false);
  protected readonly loadingExportRates = signal<boolean>(false);
  protected readonly loadingExportCalculations = signal<boolean>(false);

  subscriptions$: Subscription[] = [];

  routerLink(linkId: number): string {
    switch (this.listType) {
      case "projects":
        return `/office/projects/${linkId}`;

      case "members":
        return `/office/profile/${linkId}`;

      default:
        return "";
    }
  }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.listType = data["listType"];
    });

    const routeData$ = this.route.data.pipe(map(r => r["data"])).subscribe(data => {
      this.listTotalCount = data.count;
      this.list = data.results;
      this.searchedList = data.results;
    });

    this.subscriptions$.push(routeData$);

    this.setupSearch();

    if (this.listType === "projects") {
      this.setupProfile();
    }

    this.setupFilters();
  }

  ngAfterViewInit(): void {
    const target = document.querySelector(".office__body");
    if (target) {
      const scrollEvent$ = fromEvent(target, "scroll")
        .pipe(
          debounceTime(this.listType === "rating" ? 200 : 500),
          switchMap(() => this.onScroll()),
          catchError(err => {
            console.error("Scroll error:", err);
            return of({});
          })
        )
        .subscribe(noop);

      this.subscriptions$.push(scrollEvent$);
    } else {
      console.error(".office__body element not found");
    }
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  private setupSearch(): void {
    const searchFormSearch$ = this.searchForm
      .get("search")
      ?.valueChanges.pipe(debounceTime(300))
      .subscribe(search => {
        this.router
          .navigate([], {
            queryParams: { [this.searchParamName]: search || null },
            relativeTo: this.route,
            queryParamsHandling: "merge",
          })
          .then(() => console.debug("QueryParams changed from ProgramListComponent"));
      });

    searchFormSearch$ && this.subscriptions$.push(searchFormSearch$);

    const querySearch$ = this.route.queryParams.pipe(map(q => q["search"])).subscribe(search => {
      const searchKeys =
        this.listType === "projects" || this.listType === "rating"
          ? ["name"]
          : ["firstName", "lastName"];

      const fuse = new Fuse(this.list, {
        keys: searchKeys,
      });

      this.searchedList = search ? fuse.search(search).map(el => el.item) : this.list;
      this.cdref.detectChanges();
    });

    querySearch$ && this.subscriptions$.push(querySearch$);
  }

  private setupProfile(): void {
    const profile$ = this.authService.profile
      .pipe(
        switchMap(p => {
          this.profile = p;
          return this.subscriptionService.getSubscriptions(p.id).pipe(
            map(resp => {
              this.profileProjSubsIds = resp.results.map(sub => sub.id);
            })
          );
        })
      )
      .subscribe();

    profile$ && this.subscriptions$.push(profile$);
  }

  private setupFilters(): void {
    if (this.listType === "members") return;

    const filtersObservable$ = this.route.queryParams
      .pipe(
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        concatMap(q => {
          const { filters, extraParams } = this.buildFilterQuery(q);
          const programId = this.route.parent?.snapshot.params["programId"];

          this.listPage = 0;

          const params = new HttpParams({
            fromObject: {
              offset: "0",
              limit: this.itemsPerPage.toString(),
              ...extraParams,
            },
          });

          if (this.listType === "rating") {
            if (Object.keys(filters).length > 0) {
              return this.projectRatingService.postFilters(programId, filters, params);
            }
            return this.projectRatingService.getAll(programId, params);
          }

          if (Object.keys(filters).length > 0) {
            return this.programService.createProgramFilters(programId, filters, params);
          }
          return this.programService.getAllProjects(programId, params);
        }),
        catchError(err => {
          console.error("Error in setupFilters:", err);
          return of({ count: 0, results: [] });
        })
      )
      .subscribe(result => {
        if (!result) return;

        this.list = result.results || [];
        this.searchedList = result.results || [];
        this.listTotalCount = result.count;
        this.listPage = 0;
        this.cdref.detectChanges();
      });

    this.subscriptions$.push(filtersObservable$);
  }

  // Универсальный метод скролла
  private onScroll() {
    if (this.listTotalCount && this.list.length >= this.listTotalCount) {
      console.log("All items loaded");
      return of({});
    }

    const target = document.querySelector(".office__body");
    if (!target) {
      console.log("Target not found");
      return of({});
    }

    let shouldFetch = false;

    if (this.listType === "rating") {
      const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
      shouldFetch = scrollBottom <= 200;
      console.log("Rating scroll check:", { scrollBottom, shouldFetch });
    } else {
      if (!this.listRoot) return of({});
      const diff =
        target.scrollTop -
        this.listRoot.nativeElement.getBoundingClientRect().height +
        window.innerHeight;
      const threshold = this.listType === "projects" ? -200 : 0;
      shouldFetch = diff > threshold;
      console.log("Projects/Members scroll check:", { diff, threshold, shouldFetch });
    }

    if (shouldFetch) {
      console.log("Fetching next page:", this.listPage + 1);
      this.listPage++;
      return this.onFetch();
    }

    return of({});
  }

  // Универсальный метод загрузки данных
  // Универсальный метод загрузки данных
  private onFetch() {
    const programId = this.route.parent?.snapshot.params["programId"];
    const offset = this.listPage * this.itemsPerPage;

    console.log("onFetch called:", {
      listType: this.listType,
      programId,
      offset,
      itemsPerPage: this.itemsPerPage,
      currentPage: this.listPage,
      currentListLength: this.list.length,
    });

    // Получаем текущие query параметры для фильтров
    const currentQuery = this.route.snapshot.queryParams;
    const { filters, extraParams } = this.buildFilterQuery(currentQuery);

    const params = new HttpParams({
      fromObject: {
        offset: offset.toString(),
        limit: this.itemsPerPage.toString(),
        ...extraParams,
      },
    });

    console.log("Request params:", { filters, extraParams, paramsKeys: params.keys() });

    switch (this.listType) {
      case "rating": {
        const ratingRequest$ =
          Object.keys(filters).length > 0
            ? this.projectRatingService.postFilters(programId, filters, params)
            : this.projectRatingService.getAll(programId, params);

        return ratingRequest$.pipe(
          tap(({ count, results }) => {
            console.log("Rating response:", {
              count,
              resultsLength: results.length,
              currentListLength: this.list.length,
              offset,
              expectedNewLength: this.list.length + results.length,
            });

            this.listTotalCount = count;

            if (this.listPage === 0) {
              this.list = results;
            } else {
              const newResults = results.filter(
                newItem => !this.list.some(existingItem => existingItem.id === newItem.id)
              );
              console.log("New unique items to add:", newResults.length);
              this.list = [...this.list, ...newResults];
            }

            this.searchedList = this.list;
            this.cdref.detectChanges();
          }),
          catchError(err => {
            console.error("Error fetching ratings:", err);
            this.listPage--;
            return of({ count: this.listTotalCount || 0, results: [] });
          })
        );
      }

      case "projects": {
        const projectsRequest$ =
          Object.keys(filters).length > 0
            ? this.programService.createProgramFilters(programId, filters, params)
            : this.programService.getAllProjects(programId, params);

        return projectsRequest$.pipe(
          tap((projects: ApiPagination<Project>) => {
            console.log("Projects response:", {
              count: projects.count,
              resultsLength: projects.results.length,
              currentListLength: this.list.length,
              offset,
            });

            this.listTotalCount = projects.count;

            if (this.listPage === 0) {
              this.list = projects.results;
            } else {
              const newResults = projects.results.filter(
                newItem => !this.list.some(existingItem => existingItem.id === newItem.id)
              );
              console.log("New unique projects to add:", newResults.length);
              this.list = [...this.list, ...newResults];
            }

            this.searchedList = this.list;
            this.cdref.detectChanges();
          }),
          catchError(err => {
            console.error("Error fetching projects:", err);
            this.listPage--;
            return of({ count: this.listTotalCount || 0, results: [] });
          })
        );
      }

      case "members": {
        return this.programService.getAllMembers(programId, offset, this.itemsPerPage).pipe(
          tap((members: ApiPagination<User>) => {
            console.log("Members response:", {
              count: members.count,
              resultsLength: members.results.length,
              currentListLength: this.list.length,
              offset,
            });

            this.listTotalCount = members.count;

            if (this.listPage === 0) {
              this.list = members.results;
            } else {
              const newResults = members.results.filter(
                newItem => !this.list.some(existingItem => existingItem.id === newItem.id)
              );
              console.log("New unique members to add:", newResults.length);
              this.list = [...this.list, ...newResults];
            }

            this.searchedList = this.list;
            this.cdref.detectChanges();
          }),
          catchError(err => {
            console.error("Error fetching members:", err);
            this.listPage--;
            return of({ count: this.listTotalCount || 0, results: [] });
          })
        );
      }

      default:
        return of({ count: 0, results: [] });
    }
  }

  // Построение запроса для фильтров (кроме участников)
  private buildFilterQuery(q: any): {
    filters: Record<string, any>;
    extraParams: Record<string, any>;
  } {
    if (this.listType === "members") return { filters: {}, extraParams: {} };

    const filters: Record<string, any> = {};
    const extraParams: Record<string, any> = {};

    console.log("buildFilterQuery input:", q);

    Object.keys(q).forEach(key => {
      const value = q[key];
      if (value === undefined || value === "" || value === null) return;

      if (this.listType === "rating" && (key === "search" || key === "name__contains")) {
        extraParams["name__contains"] = value;
        return;
      }

      if (this.listType === "rating" && key === "is_rated_by_expert") {
        extraParams["is_rated_by_expert"] = value;
        return;
      }

      filters[key] = Array.isArray(value) ? value : [value];
    });

    return { filters, extraParams };
  }

  onFiltersLoaded(filters: PartnerProgramFields[]): void {
    this.availableFilters = filters;
  }

  downloadProjects(): void {
    const programId = this.route.parent?.snapshot.params["programId"];
    this.loadingExportProjects.set(true);

    this.exportFileService.exportAllProjects(programId).subscribe({
      next: blob => {
        saveFile(blob, "all", this.programDataService.getProgramName());
        this.loadingExportProjects.set(false);
      },
      error: err => {
        console.error(err);
        this.loadingExportProjects.set(false);
      },
    });
  }

  downloadSubmittedProjects(): void {
    const programId = this.route.parent?.snapshot.params["programId"];
    this.loadingExportSubmittedProjects.set(true);

    this.exportFileService.exportSubmittedProjects(programId).subscribe({
      next: blob => {
        saveFile(blob, "submitted", this.programDataService.getProgramName());
        this.loadingExportSubmittedProjects.set(false);
      },
      error: () => {
        this.loadingExportSubmittedProjects.set(false);
      },
    });
  }

  downloadRates(): void {
    const programId = this.route.parent?.snapshot.params["programId"];
    this.loadingExportRates.set(true);

    this.exportFileService.exportProgramRates(programId).subscribe({
      next: blob => {
        saveFile(blob, "rates", this.programDataService.getProgramName());
        this.loadingExportRates.set(false);
      },
      error: () => {
        this.loadingExportRates.set(false);
      },
    });
  }

  downloadCalculations(): void {}

  // Swipe логика для мобильных устройств
  private swipeStartY = 0;
  private swipeThreshold = 50;
  private isSwiping = false;

  onSwipeStart(event: TouchEvent): void {
    this.swipeStartY = event.touches[0].clientY;
    this.isSwiping = true;
  }

  onSwipeMove(event: TouchEvent): void {
    if (!this.isSwiping) return;

    const currentY = event.touches[0].clientY;
    const deltaY = currentY - this.swipeStartY;

    const progress = Math.min(deltaY / this.swipeThreshold, 1);
    this.renderer.setStyle(
      this.filterBody.nativeElement,
      "transform",
      `translateY(${progress * 100}px)`
    );
  }

  onSwipeEnd(event: TouchEvent): void {
    if (!this.isSwiping) return;

    const endY = event.changedTouches[0].clientY;
    const deltaY = endY - this.swipeStartY;

    if (deltaY > this.swipeThreshold) {
      this.closeFilter();
    }

    this.isSwiping = false;

    this.renderer.setStyle(this.filterBody.nativeElement, "transform", "translateY(0)");
  }

  closeFilter(): void {
    this.isFilterOpen = false;
  }

  /**
   * Сброс всех активных фильтров
   * Очищает все query параметры и возвращает к состоянию по умолчанию
   */
  onClearFilters(): void {
    this.searchForm.reset();

    this.router
      .navigate([], {
        queryParams: {
          search: undefined,
        },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.log("Query change from ProjectsComponent"));
  }

  openHintModal(event: Event): void {
    event.preventDefault();
    this.isHintExpertsVisible.set(false);
    this.isHintExpertsModal.set(true);
  }

  private get itemsPerPage(): number {
    return this.listType === "rating"
      ? 10
      : this.listType === "projects"
      ? this.perPage
      : this.listTake;
  }

  private get searchParamName(): string {
    return this.listType === "rating" ? "name__contains" : "search";
  }
}
