/** @format */

import { Component, inject, signal } from "@angular/core";
import { AsyncPipe, CommonModule } from "@angular/common";
import { concatMap, fromEvent, map, noop, of, Subscription, tap, throttleTime } from "rxjs";
import { OpenVacancyComponent } from "@office/feed/shared/open-vacancy/open-vacancy.component";
import { VacancyService } from "@office/services/vacancy.service";
import { Vacancy } from "@office/models/vacancy.model";
import { ApiPagination } from "@office/models/api-pagination.model";
import { ActivatedRoute, Router } from "@angular/router";
import { VacancyFilterComponent } from "../filter/vacancy-filter.component";
import { VacancyResponse } from "@office/models/vacancy-response.model";
import { ResponseCardComponent } from "@office/shared/response-card/response-card.component";

@Component({
  selector: "app-vacancies-list",
  standalone: true,
  imports: [
    CommonModule,
    OpenVacancyComponent,
    VacancyFilterComponent,
    ResponseCardComponent,
    AsyncPipe,
  ],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
})
export class VacanciesListComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  vacancyService = inject(VacancyService);

  ngOnInit() {
    this.type.set(this.router.url.split("/").slice(-1)[0] as "all" | "my");

    const routeData$ =
      this.type() === "all"
        ? this.route.data.pipe(map(r => r["data"]))
        : this.route.data.pipe(map(r => r["data"]));

    const subscription = routeData$.subscribe(
      (vacancy: ApiPagination<Vacancy> | ApiPagination<VacancyResponse>) => {
        if (this.type() === "all") {
          this.vacancyList.set(vacancy.results as Vacancy[]);
        } else if(this.type() === 'my') {
          this.responsesList.set(vacancy.results as VacancyResponse[]);
        }
        this.totalItemsCount.set(vacancy.count);
        console.log(this.vacancyList(), this.responsesList());
      }
    );

    this.subscriptions$().push(subscription);
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

  totalItemsCount = signal(0);
  vacancyList = signal<Vacancy[]>([]);
  responsesList = signal<VacancyResponse[]>([]);
  vacancyPage = signal(1);
  perFetchTake = signal(20);
  type = signal<"all" | "my" | null>(null);

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

  onFetch(offset: number, limit: number) {
    return this.vacancyService.getForProject(offset, limit).pipe(
      tap(res => {
        this.totalItemsCount.set(res.length);
      }),
      map(res => res)
    );
  }
}
