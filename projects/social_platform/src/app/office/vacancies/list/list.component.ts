/** @format */

import { Component, inject, signal } from "@angular/core";
import { AsyncPipe, CommonModule } from "@angular/common";
import {
  combineLatest,
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
import { OpenVacancyComponent } from "@office/feed/shared/open-vacancy/open-vacancy.component";
import { VacancyService } from "@office/services/vacancy.service";
import { Vacancy } from "@office/models/vacancy.model";
import { ApiPagination } from "@office/models/api-pagination.model";
import { ActivatedRoute, Router } from "@angular/router";
import { VacancyFilterComponent } from "../shared/filter/vacancy-filter.component";
import { VacancyResponse } from "@office/models/vacancy-response.model";
import { ResponseCardComponent } from "@office/shared/response-card/response-card.component";
import { InputComponent } from "@ui/components";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { SearchComponent } from "@ui/components/search/search.component";

@Component({
  selector: "app-vacancies-list",
  standalone: true,
  imports: [
    CommonModule,
    OpenVacancyComponent,
    VacancyFilterComponent,
    ResponseCardComponent,
    SearchComponent,
    ReactiveFormsModule,
  ],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
})
export class VacanciesListComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  vacancyService = inject(VacancyService);

  constructor(private readonly fb: FormBuilder) {
    this.searchForm = this.fb.group({
      search: [""],
    });
  }

  ngOnInit() {
    const urlSegment = this.router.url.split("/").slice(-1)[0];
    const trimmedSegment = urlSegment.split("?")[0];
    this.type.set(trimmedSegment as "all" | "my");

    this.searchForm
      .get("search")
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(value => {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { role_contains: value || null },
            queryParamsHandling: "merge",
          });
        })
      )
      .subscribe();

    const routeData$ =
      this.type() === "all"
        ? this.route.data.pipe(map(r => r["data"]))
        : this.route.data.pipe(map(r => r["data"]));

    const subscription = routeData$.subscribe(
      (vacancy: ApiPagination<Vacancy> | ApiPagination<VacancyResponse>) => {
        if (this.type() === "all") {
          this.vacancyList.set(vacancy.results as Vacancy[]);
        } else if (this.type() === "my") {
          this.responsesList.set(vacancy.results as VacancyResponse[]);
        }
        this.totalItemsCount.set(vacancy.count);
      }
    );

    const queryParams$ = this.route.queryParams
      .pipe(
        debounceTime(200),
        tap(params => {
          const requiredExperience = params["required_experience"]
            ? params["required_experience"]
            : undefined;

          this.searchForm
            .get("search")
            ?.setValue(params["role_contains"] || "", { emitEvent: false });

          const workFormat = params["work_format"] ? params["work_format"] : undefined;
          const workSchedule = params["work_schedule"] ? params["work_schedule"] : undefined;
          const salaryMax = params["salary_max"] ? params["salary_max"] : undefined;
          const salaryMin = params["salary_min"] ? params["salary_min"] : undefined;

          this.requiredExperience.set(requiredExperience);
          this.workFormat.set(workFormat);
          this.workSchedule.set(workSchedule);
          this.salaryMin.set(salaryMin);
          this.salaryMax.set(salaryMax);
        }),
        switchMap(() => this.onFetch(0, 20))
      )
      .subscribe((result: any) => {
        this.vacancyList.set(result.results);
      });

    this.subscriptions$().push(subscription, queryParams$);
  }

  ngAfterViewInit() {
    const target = document.querySelector(".office__body");
    if (target) {
      const scrollEvents$ = fromEvent(target, "scroll")
        .pipe(
          concatMap(() => this.onScroll()),
          throttleTime(500)
        )
        .subscribe(noop);

      this.subscriptions$().push(scrollEvents$);
    }
  }

  ngOnDestroy() {
    this.subscriptions$().forEach(($: any) => $.unsubscribe());
  }

  searchForm: FormGroup;
  totalItemsCount = signal(0);
  vacancyList = signal<Vacancy[]>([]);
  responsesList = signal<VacancyResponse[]>([]);
  vacancyPage = signal(1);
  perFetchTake = signal(20);
  type = signal<"all" | "my" | null>(null);

  requiredExperience = signal<string | undefined>(undefined);
  workFormat = signal<string | undefined>(undefined);
  workSchedule = signal<string | undefined>(undefined);
  salaryMin = signal<string | undefined>(undefined);
  salaryMax = signal<string | undefined>(undefined);

  subscriptions$ = signal<Subscription[]>([]);

  onScroll() {
    if (this.totalItemsCount() && this.vacancyList().length >= this.totalItemsCount())
      return of({});

    const target = document.querySelector(".office__body");
    if (!target) return of({});

    const diff = target.scrollTop - target.scrollHeight + target.clientHeight;

    if (diff > 0) {
      return this.onFetch(this.vacancyPage() * this.perFetchTake(), this.perFetchTake()).pipe(
        tap((vacancyChunk: Vacancy[]) => {
          this.vacancyPage.update(page => page + 1);
          this.vacancyList.update(items => [...items, ...vacancyChunk]);
        })
      );
    }

    return of({});
  }

  onSearhValueChanged(event: string) {
    this.searchForm.get("search")?.setValue(event);
  }

  onSearchSubmit() {
    const value = this.searchForm.get("search")?.value;
    this.router.navigate([], {
      queryParams: { role_contains: value || null },
      queryParamsHandling: "merge",
      relativeTo: this.route,
    });
  }

  onFetch(offset: number, limit: number) {
    return this.vacancyService
      .getForProject(
        limit,
        offset,
        undefined,
        this.requiredExperience(),
        this.workFormat(),
        this.workSchedule(),
        this.salaryMin(),
        this.salaryMax(),
        this.searchForm.get("search")?.value
      )
      .pipe(
        tap((res: any) => {
          this.totalItemsCount.set(res.count);
          this.vacancyList.update(items => [...items, ...res.results]);
        }),
        map(res => res)
      );
  }
}
