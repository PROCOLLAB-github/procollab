import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpenVacancyComponent } from '@office/feed/shared/open-vacancy/open-vacancy.component';
import { ActivatedRoute } from '@angular/router';
import { Vacancy } from '@office/models/vacancy.model';
import { VacancyService } from '@office/services/vacancy.service';
import { concatMap, fromEvent, map, noop, of, skip, Subscription, tap, throttleTime } from 'rxjs';
import { ApiPagination } from '@office/models/api-pagination.model';

@Component({
  selector: 'app-vacancies',
  standalone: true,
  imports: [CommonModule, OpenVacancyComponent],
  templateUrl: './vacancies.component.html',
  styleUrl: './vacancies.component.scss'
})

export class VacanciesComponent implements OnInit, AfterViewInit, OnDestroy {
  route = inject(ActivatedRoute);
  vacancyService = inject(VacancyService);

  ngOnInit() {
    const routeData$ = this.route.data
      .pipe(map(r => r["data"]))
      .subscribe((vacancy: ApiPagination<Vacancy>) => {
        this.vacancyList.set(vacancy.results);
        this.totalItemsCount.set(vacancy.count);
      });
    this.subscriptions$().push(routeData$);
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
    this.subscriptions$().forEach($ => $.unsubscribe());
  }

  totalItemsCount = signal(0);
  vacancyList = signal<Vacancy[]>([]);
  vacancyPage = signal(1);
  perFetchTake = signal(20);

  subscriptions$ = signal<Subscription[]>([]);

  onScroll() {
    if (this.totalItemsCount() && this.vacancyList().length >= this.totalItemsCount()) return of({});

    const target = document.querySelector(".office__body");
    if (!target) return of({});

    const diff =
      target.scrollTop - target.scrollHeight + target.clientHeight;

    if (diff > 0) {
      return this.onFetch(
        this.vacancyPage() * this.perFetchTake(),
        this.perFetchTake()
      ).pipe(
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
