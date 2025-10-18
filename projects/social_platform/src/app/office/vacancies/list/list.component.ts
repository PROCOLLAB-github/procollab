/** @format */

// list.component.ts
/** @format */

import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  concatMap,
  debounceTime,
  fromEvent,
  map,
  noop,
  of,
  Subscription,
  switchMap,
  tap,
  throttleTime,
} from "rxjs";
import { VacancyService } from "@office/services/vacancy.service";
import { Vacancy } from "@office/models/vacancy.model";
import { ApiPagination } from "@office/models/api-pagination.model";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { VacancyResponse } from "@office/models/vacancy-response.model";
import { ResponseCardComponent } from "@office/features/response-card/response-card.component";
import { ProjectVacancyCardComponent } from "@office/projects/detail/shared/project-vacancy-card/project-vacancy-card.component";
import { ButtonComponent, IconComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";

@Component({
  selector: "app-vacancies-list",
  standalone: true,
  imports: [
    CommonModule,
    ResponseCardComponent,
    ProjectVacancyCardComponent,
    ButtonComponent,
    IconComponent,
    ModalComponent,
    RouterLink,
  ],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
})
export class VacanciesListComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  vacancyService = inject(VacancyService);

  totalItemsCount = signal(0);
  vacancyList = signal<Vacancy[]>([]);
  responsesList = signal<VacancyResponse[]>([]);
  vacancyPage = signal(1);
  perFetchTake = signal(20);
  type = signal<"all" | "my" | null>(null);

  requiredExperience = signal<string | undefined>(undefined);
  roleContains = signal<string | undefined>(undefined);
  workFormat = signal<string | undefined>(undefined);
  workSchedule = signal<string | undefined>(undefined);
  salary = signal<string | undefined>(undefined);

  isMyModal = signal<boolean>(false);

  subscriptions$ = signal<Subscription[]>([]);

  ngOnInit() {
    const urlSegment = this.router.url.split("/").slice(-1)[0];
    const trimmedSegment = urlSegment.split("?")[0];
    this.type.set(trimmedSegment as "all" | "my");

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

          const roleContains = params["role_contains"] || undefined;
          const workFormat = params["work_format"] ? params["work_format"] : undefined;
          const workSchedule = params["work_schedule"] ? params["work_schedule"] : undefined;
          const salary = params["salary"] ? params["salary"] : undefined;

          this.requiredExperience.set(requiredExperience);
          this.roleContains.set(roleContains);
          this.workFormat.set(workFormat);
          this.workSchedule.set(workSchedule);
          this.salary.set(salary);
        }),
        switchMap(() => this.onFetch(0, 20))
      )
      .subscribe((result: any) => {
        if (this.type() === "all") {
          this.vacancyList.set(result.results);
        }
        this.totalItemsCount.set(result.count);
        this.vacancyPage.set(1);
      });

    this.subscriptions$().push(subscription, queryParams$);

    this.myModalSetup();
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

  private onScroll() {
    if (this.totalItemsCount() && this.vacancyList().length >= this.totalItemsCount())
      return of({});

    const target = document.querySelector(".office__body");
    if (!target) return of({});

    const diff = target.scrollTop - target.scrollHeight + target.clientHeight;

    if (diff > 0) {
      return this.onFetch(this.vacancyPage() * this.perFetchTake(), this.perFetchTake()).pipe(
        tap((result: any) => {
          this.vacancyPage.update(page => page + 1);
          this.vacancyList.update(items => [...items, ...result.results]);
        })
      );
    }

    return of({});
  }

  private onFetch(offset: number, limit: number) {
    return this.vacancyService
      .getForProject(
        limit,
        offset,
        undefined,
        this.requiredExperience(),
        this.workFormat(),
        this.workSchedule(),
        this.salary(),
        this.roleContains()
      )
      .pipe(map(res => res));
  }

  private myModalSetup() {
    if (this.type() === "my" && this.responsesList().length === 0) {
      this.isMyModal.set(true);
    } else {
      this.isMyModal.set(false);
    }
  }
}
