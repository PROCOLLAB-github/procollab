/** @format */

import { AfterViewInit, ChangeDetectorRef, Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { AvatarComponent } from "../../../../../social_platform/src/app/ui/components/avatar/avatar.component";
import { ButtonComponent } from "@ui/components";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { IconComponent } from "@uilib";
import { concatMap, fromEvent, noop, of, Subscription, tap, throttleTime } from "rxjs";
import { WebinarComponent } from "../shared/webinar/webinar.component";

@Component({
  selector: "app-list",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AvatarComponent,
    ButtonComponent,
    ModalComponent,
    IconComponent,
    WebinarComponent,
    ParseBreaksPipe,
    ParseLinksPipe,
  ],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
})
export class WebinarsListComponent implements AfterViewInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  cdRef = inject(ChangeDetectorRef);

  webinars = Array(5);

  subscriptions$ = signal<Subscription[]>([]);

  ngAfterViewInit(): void {
    // const target = document.querySelector(".office__body");
    // if (target) {
    //   const scrollEvents$ = fromEvent(target, "scroll")
    //     .pipe(
    //       concatMap(() => this.onScroll()),
    //       throttleTime(500)
    //     )
    //     .subscribe(noop);
    //   this.subscriptions$().push(scrollEvents$);
    // }
  }

  //  onScroll() {
  //     if (this.totalItemsCount() && this.vacancyList().length >= this.totalItemsCount())
  //       return of({});

  //     const target = document.querySelector(".office__body");
  //     if (!target) return of({});

  //     const diff = target.scrollTop - target.scrollHeight + target.clientHeight;

  //     if (diff > 0) {
  //       return this.onFetch(this.vacancyPage() * this.perFetchTake(), this.perFetchTake()).pipe(
  //         tap((vacancyChunk: Vacancy[]) => {
  //           this.vacancyPage.update(page => page + 1);
  //           this.vacancyList.update(items => [...items, ...vacancyChunk]);
  //         })
  //       );
  //     }

  //     return of({});
  //   }

  // TODO дописать логику на onScroll для offset и limit

  // TODO дописать интерфейс под бэк с вебинарами

  // TODO добавить логику с post запросом на регистрацию

  // TODO добавить получение данных с бэка для вебинаров и записей
}
