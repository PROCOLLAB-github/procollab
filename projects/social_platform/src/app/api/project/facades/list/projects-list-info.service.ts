/** @format */

import { ElementRef, inject, Injectable, signal } from "@angular/core";
import { ActivatedRoute, Params } from "@angular/router";
import {
  concatMap,
  distinctUntilChanged,
  EMPTY,
  fromEvent,
  map,
  of,
  Subject,
  takeUntil,
  tap,
  throttleTime,
} from "rxjs";
import { NavService } from "@ui/services/nav/nav.service";
import { ProjectService } from "../../project.service";
import { ProjectsInfoService } from "../projects-info.service";
import { ProgramDetailListInfoService } from "../../../program/facades/detail/program-detail-list-info.service";
import { inviteToProjectMapper } from "@utils/helpers/inviteToProjectMapper";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "projects/skills/src/models/api-pagination.model";
import { Project } from "projects/social_platform/src/app/domain/project/project.model";

@Injectable()
export class ProjectsListInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly navService = inject(NavService);
  private readonly projectService = inject(ProjectService);
  private readonly projectsInfoService = inject(ProjectsInfoService);
  private readonly programDetailListInfoService = inject(ProgramDetailListInfoService);

  private readonly destroy$ = new Subject<void>();

  private readonly projectsCount = signal<number>(0);
  private readonly currentPage = signal<number>(1);
  private readonly projectsPerFetch = signal<number>(15);

  private readonly currentSearchQuery = signal<string | undefined>(undefined);
  private previousReqQuery = signal<Record<string, any>>({});

  readonly projects = signal<Project[]>([]);

  private readonly isAll = this.projectsInfoService.isAll;
  private readonly isSubs = this.projectsInfoService.isSubs;
  private readonly isDashboard = this.projectsInfoService.isDashboard;
  private readonly isInvites = this.projectsInfoService.isInvites;

  initializationProjectsList(): void {
    this.navService.setNavTitle("Проекты");

    this.projectsInfoService.initializationRouterEvents();

    if (this.isDashboard() || this.isSubs()) {
      this.programDetailListInfoService.setupProfile();
    }

    this.route.queryParams
      .pipe(
        map(q => q["name__contains"]),
        takeUntil(this.destroy$)
      )
      .subscribe(search => {
        if (search !== this.currentSearchQuery()) {
          this.currentSearchQuery.set(search);
          this.currentPage.set(1);
        }
      });

    if (location.href.includes("/all")) {
      const observable = this.route.queryParams.pipe(
        distinctUntilChanged(),
        concatMap(q => {
          const reqQuery = this.buildFilterQuery(q);

          if (JSON.stringify(reqQuery) !== JSON.stringify(this.previousReqQuery())) {
            try {
              this.previousReqQuery.set(reqQuery);
              return this.projectService.getAll(new HttpParams({ fromObject: reqQuery }));
            } catch (e) {
              console.error(e);
              this.previousReqQuery.set(reqQuery);
              return this.projectService.getAll();
            }
          }

          this.previousReqQuery.set(reqQuery);

          return of(0);
        }),
        takeUntil(this.destroy$)
      );

      observable.pipe(takeUntil(this.destroy$)).subscribe(projects => {
        if (typeof projects === "number") return;

        this.projects.set(projects.results);
      });
    }

    this.route.data
      .pipe(
        map(r => r["data"]),
        takeUntil(this.destroy$)
      )
      .subscribe(projects => {
        this.projectsCount.set(projects.count);

        if (this.isInvites()) {
          this.projects.set(inviteToProjectMapper(projects ?? []));
        } else {
          this.projects.set(projects.results ?? []);
        }
      });
  }

  initScroll(target: HTMLElement, listRoot: ElementRef<HTMLUListElement>): void {
    fromEvent(target, "scroll")
      .pipe(
        throttleTime(300),
        concatMap(() => this.onScroll(target, listRoot)),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildFilterQuery(q: Params): Record<string, string> {
    const reqQuery: Record<string, any> = {};

    if (q["name__contains"]) {
      reqQuery["name__contains"] = q["name__contains"];
    }
    if (q["industry"]) {
      reqQuery["industry"] = q["industry"];
    }
    if (q["step"]) {
      reqQuery["step"] = q["step"];
    }
    if (q["membersCount"]) {
      reqQuery["collaborator__count__gte"] = q["membersCount"];
    }
    if (q["anyVacancies"]) {
      reqQuery["any_vacancies"] = q["anyVacancies"];
    }
    if (q["is_rated_by_expert"]) {
      reqQuery["is_rated_by_expert"] = q["is_rated_by_expert"];
    }
    if (q["is_mospolytech"]) {
      reqQuery["is_mospolytech"] = q["is_mospolytech"];
      reqQuery["partner_program"] = q["partner_program"];
    }

    return reqQuery;
  }

  private onScroll(target: HTMLElement, listRoot: ElementRef<HTMLUListElement>) {
    if (this.isSubs() || this.isInvites()) {
      return EMPTY;
    }

    if (this.projectsCount() && this.projects().length >= this.projectsCount()) return EMPTY;

    if (!target || !listRoot.nativeElement) return EMPTY;

    const diff =
      target.scrollTop - listRoot.nativeElement.getBoundingClientRect().height + window.innerHeight;

    if (diff > 0) {
      return this.onFetch(
        this.currentPage() * this.projectsPerFetch(),
        this.projectsPerFetch()
      ).pipe(
        tap(chunk => {
          this.currentPage.update(p => p + 1);
          this.projects.update(() => [...this.projects(), ...chunk]);
        })
      );
    }

    return EMPTY;
  }

  private onFetch(skip: number, take: number) {
    if (this.isAll()) {
      const queries = this.route.snapshot.queryParams;

      const queryParams = {
        offset: skip,
        limit: take,
        ...this.buildFilterQuery(queries),
      };

      return this.projectService.getAll(new HttpParams({ fromObject: queryParams })).pipe(
        map((projects: ApiPagination<Project>) => {
          return projects.results;
        })
      );
    } else {
      return this.projectService.getMy().pipe(
        map((projects: ApiPagination<Project>) => {
          this.projectsCount.set(projects.count);
          return projects.results;
        })
      );
    }
  }

  sliceInvitesArray(inviteId: number): void {
    this.projects.update(projects => projects.filter(p => p.inviteId !== inviteId));
    this.projectsCount.update(() => Math.max(0, this.projectsCount() - 1));
  }
}
