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
} from "@angular/core";
import {
  catchError,
  concatMap,
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
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { SearchComponent } from "@ui/components/search/search.component";
import { User } from "@auth/models/user.model";
import { Project } from "@office/models/project.model";
import { ProjectCardComponent } from "@office/shared/project-card/project-card.component";
import { MemberCardComponent } from "@office/shared/member-card/member-card.component";
import { ProgramService } from "@office/program/services/program.service";
import { AuthService } from "@auth/services";
import { SubscriptionService } from "@office/services/subscription.service";
import { ApiPagination } from "@models/api-pagination.model";
import { HttpParams } from "@angular/common/http";
import { PartnerProgramFields } from "@office/models/partner-program-fields.model";

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
    ProjectCardComponent,
    MemberCardComponent,
  ],
  standalone: true,
})
export class ProgramListComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor() {
    this.searchForm = this.fb.group({
      search: [""],
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
  private readonly authService = inject(AuthService);
  private readonly subscriptionService = inject(SubscriptionService);

  private previousReqQuery: Record<string, any> = {};
  private availableFilters: PartnerProgramFields[] = [];

  searchForm: FormGroup;

  listTotalCount?: number;
  listPage = 1;
  listTake = 20;
  perPage = 21;

  list: any[] = [];
  searchedList: any[] = [];
  profile?: User;
  profileProjSubsIds?: number[];

  listType: "projects" | "members" = "projects";

  subscriptions$: Subscription[] = [];

  ngOnInit(): void {
    // Определяем тип списка
    this.route.data.subscribe(data => {
      this.listType = data["listType"];
    });

    // Загружаем начальные данные из резолвера
    const routeData$ = this.route.data.pipe(map(r => r["data"])).subscribe(data => {
      this.listTotalCount = data.count;
      this.list = data.results;
      this.searchedList = data.results;
    });

    this.subscriptions$.push(routeData$);

    // Форма поиска
    const searchFormSearch$ = this.searchForm.get("search")?.valueChanges.subscribe(search => {
      this.router
        .navigate([], {
          queryParams: { search },
          relativeTo: this.route,
          queryParamsHandling: "merge",
        })
        .then(() => console.debug("QueryParams changed from ProgramListComponent"));
    });

    searchFormSearch$ && this.subscriptions$.push(searchFormSearch$);

    if (this.listType === "projects") {
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

    const querySearch$ = this.route.queryParams.pipe(map(q => q["search"])).subscribe(search => {
      const searchKeys = this.listType === "projects" ? ["name"] : ["firstName", "lastName"];

      const fuse = new Fuse(this.list, {
        keys: searchKeys,
      });

      this.searchedList = search ? fuse.search(search).map(el => el.item) : this.list;
    });

    querySearch$ && this.subscriptions$.push(querySearch$);

    // Фильтры (только для проектов)
    if (this.listType === "projects") {
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
                return this.programService
                  .createProgramFilters(programId, reqQuery["filters"])
                  .pipe(
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
            this.cdref.detectChanges();
          }
        });

      this.subscriptions$.push(filtersObservable$);
    }
  }

  ngAfterViewInit(): void {
    const target = document.querySelector(".office__body");
    if (target) {
      const scrollEvent$ = fromEvent(target, "scroll")
        .pipe(
          throttleTime(500),
          concatMap(() => this.onScroll())
        )
        .subscribe(noop);
      this.subscriptions$.push(scrollEvent$);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  // Логика бесконечной прокрутки
  private onScroll() {
    if (this.listTotalCount && this.list.length >= this.listTotalCount) return of({});

    const target = document.querySelector(".office__body");
    if (!target || !this.listRoot) return of({});

    const diff =
      target.scrollTop -
      this.listRoot.nativeElement.getBoundingClientRect().height +
      window.innerHeight;
    const threshold = this.listType === "projects" ? -200 : 0;

    if (diff > threshold) {
      return this.onFetch();
    }

    return of({});
  }

  // Загрузка следующей порции данных
  private onFetch() {
    const programId = this.route.parent?.snapshot.params["programId"];

    if (this.listType === "projects") {
      const offset = this.listPage * this.perPage;
      const params = new HttpParams({ fromObject: { offset, limit: this.perPage } });

      return this.programService.getAllProjects(programId, params).pipe(
        tap((projects: ApiPagination<Project>) => {
          this.listTotalCount = projects.count;
          this.list = [...this.list, ...projects.results];
          this.searchedList = this.list;
          this.listPage++;
          this.cdref.detectChanges();
        })
      );
    } else {
      return this.programService
        .getAllMembers(programId, this.listPage * this.listTake, this.listTake)
        .pipe(
          tap((members: ApiPagination<User>) => {
            this.listTotalCount = members.count;
            this.list = [...this.list, ...members.results];
            this.searchedList = this.list;
            this.listPage++;
            this.cdref.detectChanges();
          })
        );
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

  // Обработка загруженных фильтров
  onFiltersLoaded(filters: PartnerProgramFields[]): void {
    this.availableFilters = filters;
  }

  // Swipe логика для мобильных устройств
  isFilterOpen = false;
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
}
