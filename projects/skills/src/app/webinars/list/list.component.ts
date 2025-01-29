/** @format */

import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { AvatarComponent } from "../../../../../social_platform/src/app/ui/components/avatar/avatar.component";
import { ButtonComponent } from "@ui/components";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { IconComponent } from "@uilib";
import { concatMap, fromEvent, map, noop, of, Subscription, tap, throttleTime } from "rxjs";
import { WebinarComponent } from "../shared/webinar/webinar.component";
import { Webinar } from "projects/skills/src/models/webinars.model";
import { WebinarService } from "../services/webinar.service";
import { ApiPagination } from "projects/skills/src/models/api-pagination.model";

@Component({
  selector: "app-list",
  standalone: true,
  imports: [CommonModule, RouterModule, WebinarComponent],
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
})
export class WebinarsListComponent implements OnInit, AfterViewInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  webinarService = inject(WebinarService);
  cdRef = inject(ChangeDetectorRef);

  totalItemsCount = signal(0);
  webinarList = signal<Webinar[]>([]);
  recordsList = signal<Webinar[]>([]);
  webinarPage = signal(1);
  perFetchTake = signal(20);

  type = signal<"actual" | "records" | null>(null);

  subscriptions$ = signal<Subscription[]>([]);

  ngOnInit(): void {
    this.type.set(this.router.url.split("/").slice(-1)[0] as "actual" | "records");

    const routeData$ =
      this.type() === "actual"
        ? this.route.data.pipe(map(r => r["data"]))
        : this.route.data.pipe(map(r => r["data"]));

    const subscription = routeData$.subscribe((vacancy: ApiPagination<Webinar>) => {
      if (this.type() === "actual") {
        this.webinarList.set(vacancy.results as Webinar[]);
      } else if (this.type() === "records") {
        this.recordsList.set(vacancy.results as Webinar[]);
      }
      this.totalItemsCount.set(vacancy.count);
    });
  }

  ngAfterViewInit(): void {
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

  onScroll() {
    if (this.totalItemsCount() && this.recordsList().length >= this.totalItemsCount())
      return of({});

    if (this.totalItemsCount() && this.webinarList().length >= this.totalItemsCount())
      return of({});

    const target = document.querySelector(".office__body");
    if (!target) return of({});

    const diff = target.scrollTop - target.scrollHeight + target.clientHeight;

    if (diff > 0) {
      return this.onFetch(this.webinarPage() * this.perFetchTake(), this.perFetchTake()).pipe(
        tap((webinarChunk: Webinar[]) => {
          if (this.type() === "actual") {
            this.webinarPage.update(page => page + 1);
            this.webinarList.update(items => [...items, ...webinarChunk]);
          } else if (this.type() === "records") {
            this.webinarPage.update(page => page + 1);
            this.recordsList.update(items => [...items, ...webinarChunk]);
          }
        })
      );
    }

    return of({});
  }

  onFetch(offset: number, limit: number) {
    if (this.type() === "actual") {
      return this.webinarService.getActualWebinars(limit, offset).pipe(
        tap((res: any) => {
          this.totalItemsCount.set(res.count);
          this.webinarList.update(items => [...items, ...res.results]);
        }),
        map(res => res)
      );
    } else if (this.type() === "records") {
      return this.webinarService.getRecords(limit, offset).pipe(
        tap((res: any) => {
          this.totalItemsCount.set(res.count);
          this.recordsList.update(items => [...items, ...res.results]);
        }),
        map(res => res)
      );
    }

    return of([]);
  }
}
