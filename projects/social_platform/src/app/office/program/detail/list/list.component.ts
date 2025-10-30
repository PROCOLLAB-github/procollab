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
  throttleTime,
} from "rxjs";
import { ProjectsFilterComponent } from "@office/projects/projects-filter/projects-filter.component";
import Fuse from "fuse.js";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
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
import { CheckboxComponent } from "@ui/components";
import { InfoCardComponent } from "@office/features/info-card/info-card.component";
import { tagsFilter } from "projects/core/src/consts/filters/tags-filter.const";

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
    CheckboxComponent,
    InfoCardComponent,
  ],
  standalone: true,
})
export class ProgramListComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor() {
    const isRatedByExpert =
      this.route.snapshot.queryParams["is_rated_by_expert"] === "true"
        ? true
        : this.route.snapshot.queryParams["is_rated_by_expert"] === "false"
        ? false
        : null;

    const searchValue =
      this.route.snapshot.queryParams["search"] ||
      this.route.snapshot.queryParams["name__contains"];
    const decodedSearchValue = searchValue ? decodeURIComponent(searchValue) : "";

    this.searchForm = this.fb.group({
      search: [decodedSearchValue],
    });

    this.filterForm = this.fb.group({
      filterTag: [isRatedByExpert, Validators.required],
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
  private readonly projectRatingService = inject(ProjectRatingService);
  private readonly authService = inject(AuthService);
  private readonly subscriptionService = inject(SubscriptionService);

  private previousReqQuery: Record<string, any> = {};
  private availableFilters: PartnerProgramFields[] = [];

  searchForm: FormGroup;
  filterForm: FormGroup;

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

    console.log(this.listType);

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

    if (this.listType === "rating") {
      this.setupRatingQueryParams();
    }
  }

  ngAfterViewInit(): void {
    const target = document.querySelector(".office__body");
    if (target) {
      const scrollEvent$ = fromEvent(target, "scroll")
        .pipe(
          debounceTime(this.listType === "rating" ? 200 : 500),
          concatMap(() => this.onScroll()),
          throttleTime(this.listType === "rating" ? 2000 : 500)
        )
        .subscribe(noop);

      this.subscriptions$.push(scrollEvent$);
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
    if (this.listType !== "projects") return;

    const filtersObservable$ = this.route.queryParams
      .pipe(
        distinctUntilChanged(),
        concatMap(q => {
          const reqQuery = this.buildFilterQuery(q);
          const programId = this.route.parent?.snapshot.params["programId"];

          if (JSON.stringify(reqQuery) !== JSON.stringify(this.previousReqQuery)) {
            this.previousReqQuery = reqQuery;

            const hasFilters =
              reqQuery && reqQuery["filters"] && Object.keys(reqQuery["filters"]).length > 0;
            const params = new HttpParams({ fromObject: { offset: 0, limit: this.perPage } });

            if (hasFilters) {
              return this.programService.createProgramFilters(programId, reqQuery["filters"]).pipe(
                catchError(err => {
                  console.error("createFilters failed, fallback to getAllProjects()", err);
                  return this.programService.getAllProjects(programId, params);
                })
              );
            }

            return this.programService.getAllProjects(programId, params).pipe(
              catchError(err => {
                console.error("getAllProjects failed", err);
                return this.programService.getAllProjects(programId, params);
              })
            );
          }

          return of(null);
        })
      )
      .subscribe(result => {
        if (result && typeof result !== "number") {
          this.list = result.results;
          this.searchedList = result.results;
          this.listTotalCount = result.count;
          this.listPage = 0;
          this.cdref.detectChanges();
        }
      });

    this.subscriptions$.push(filtersObservable$);
  }

  private setupRatingQueryParams(): void {
    const queryParams$ = this.route.queryParams
      .pipe(
        debounceTime(200),
        tap(params => {
          const isRatedByExpert =
            params["is_rated_by_expert"] === "true"
              ? true
              : params["is_rated_by_expert"] === "false"
              ? false
              : undefined;
          const searchValue = params["name__contains"] || "";

          this.isRatedByExpert.set(isRatedByExpert);
          this.searchValue.set(searchValue);
        }),
        switchMap(() => {
          this.listPage = 0;
          return this.onFetch();
        })
      )
      .subscribe();

    this.subscriptions$.push(queryParams$);
  }

  // Методы фильтрации
  setValue(event: Event): void {
    event.stopPropagation();
    this.filterForm.get("filterTag")?.setValue(!this.filterForm.get("filterTag")?.value);

    this.router.navigate([], {
      queryParams: { is_rated_by_expert: this.filterForm.get("filterTag")?.value },
      relativeTo: this.route,
      queryParamsHandling: "merge",
    });
  }

  // Универсальный метод скролла
  private onScroll() {
    if (this.listTotalCount && this.list.length >= this.listTotalCount) return of({});

    const target = document.querySelector(".office__body");
    if (!target || (this.listType !== "rating" && !this.listRoot)) return of({});

    let shouldFetch = false;

    if (this.listType === "rating") {
      // Логика для rating
      const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
      shouldFetch = scrollBottom <= 0;
    } else {
      // Логика для projects и members
      const diff =
        target.scrollTop -
        this.listRoot!.nativeElement.getBoundingClientRect().height +
        window.innerHeight;
      const threshold = this.listType === "projects" ? -200 : 0;
      shouldFetch = diff > threshold;
    }

    if (shouldFetch) {
      this.listPage++;
      return this.onFetch();
    }

    return of({});
  }

  // Универсальный метод загрузки данных
  private onFetch() {
    const programId = this.route.parent?.snapshot.params["programId"];
    const offset = this.listPage * this.itemsPerPage;

    switch (this.listType) {
      case "projects":
        return this.programService
          .getAllProjects(
            programId,
            new HttpParams({ fromObject: { offset, limit: this.itemsPerPage } })
          )
          .pipe(
            tap((projects: ApiPagination<Project>) => {
              this.listTotalCount = projects.count;
              if (this.listPage === 0) {
                this.list = projects.results;
              } else {
                this.list = [...this.list, ...projects.results];
              }
              this.searchedList = this.list;
              this.cdref.detectChanges();
            })
          );

      case "members":
        return this.programService.getAllMembers(programId, offset, this.itemsPerPage).pipe(
          tap((members: ApiPagination<User>) => {
            this.listTotalCount = members.count;
            if (this.listPage === 0) {
              this.list = members.results;
            } else {
              this.list = [...this.list, ...members.results];
            }
            this.searchedList = this.list;
            this.cdref.detectChanges();
          })
        );

      case "rating":
        return this.projectRatingService
          .getAll(programId, offset, this.itemsPerPage, this.isRatedByExpert(), this.searchValue())
          .pipe(
            tap(({ count, results }) => {
              this.listTotalCount = count;
              if (this.listPage === 0) {
                this.list = results;
              } else {
                this.list = [...this.list, ...results];
              }
              this.searchedList = this.list;
              this.cdref.detectChanges();
            })
          );

      default:
        return of({});
    }
  }

  // Построение запроса для фильтров (только для проектов)
  private buildFilterQuery(q: any): Record<string, any> {
    if (this.listType !== "projects") return {};

    const filters: Record<string, any[]> = {};

    if (this.availableFilters.length === 0) {
      Object.keys(q).forEach(key => {
        if (key !== "search" && q[key] !== undefined && q[key] !== "") {
          filters[key] = Array.isArray(q[key]) ? q[key] : [q[key]];
        }
      });
    } else {
      this.availableFilters.forEach((filter: PartnerProgramFields) => {
        const value = q[filter.name];
        if (value !== undefined && value !== "") {
          filters[filter.name] = Array.isArray(value) ? value : [value];
        }
      });
    }

    return { filters };
  }

  onFiltersLoaded(filters: PartnerProgramFields[]): void {
    this.availableFilters = filters;
  }

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

  private get itemsPerPage(): number {
    return this.listType === "rating"
      ? 8
      : this.listType === "projects"
      ? this.perPage
      : this.listTake;
  }

  private get searchParamName(): string {
    return this.listType === "rating" ? "name__contains" : "search";
  }
}
