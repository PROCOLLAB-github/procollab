/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, NavigationEnd, Params, Router, RouterLink } from "@angular/router";
import {
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
import { AuthService } from "@auth/services";
import { Project } from "@models/project.model";
import { User } from "@auth/models/user.model";
import { NavService } from "@services/nav.service";
import { ProjectService } from "@services/project.service";
import Fuse from "fuse.js";
import { HttpParams } from "@angular/common/http";
import { ApiPagination } from "@models/api-pagination.model";
import { ProjectsFilterComponent } from "../projects-filter/projects-filter.component";
import { ProjectCardComponent } from "../../shared/project-card/project-card.component";
import {} from "@angular/common";
import { IconComponent } from "@ui/components";
import { SubscriptionService } from "@office/services/subscription.service";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
  standalone: true,
  imports: [IconComponent, RouterLink, ProjectCardComponent, ProjectsFilterComponent],
})
export class ProjectsListComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly navService: NavService,
    private readonly projectService: ProjectService,
    private readonly cdref: ChangeDetectorRef,
    private readonly router: Router,
    private readonly subscriptionService: SubscriptionService
  ) {}

  ngOnInit(): void {
    this.navService.setNavTitle("Проекты");

    const routeUrl$ = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isMy = location.href.includes("/my");
        this.isAll = location.href.includes("/all");
        this.isSubs = location.href.includes("/subsription");
      }
    });
    routeUrl$ && this.subscriptions$.push(routeUrl$);

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

    const querySearch$ = this.route.queryParams.pipe(map(q => q["search"])).subscribe(search => {
      const fuse = new Fuse(this.projects, {
        keys: ["name"],
      });

      this.searchedProjects = search ? fuse.search(search).map(el => el.item) : this.projects;
    });

    querySearch$ && this.subscriptions$.push(querySearch$);

    if (location.href.includes("/all")) {
      const observable = this.route.queryParams.pipe(
        distinctUntilChanged(),
        concatMap(q => {
          const reqQuery = this.buildFilterQuery(q);

          if (JSON.stringify(reqQuery) !== JSON.stringify(this.previousReqQuery)) {
            try {
              this.previousReqQuery = reqQuery;
              return this.projectService.getAll(new HttpParams({ fromObject: reqQuery }));
            } catch (e) {
              console.error(e);
              this.previousReqQuery = reqQuery;
              return this.projectService.getAll();
            }
          }

          this.previousReqQuery = reqQuery;

          return of(0);
        })
      );

      const queryIndustry$ = observable.subscribe(projects => {
        if (typeof projects === "number") return;

        this.projects = projects.results;
        this.searchedProjects = projects.results;

        this.cdref.detectChanges();
      });

      queryIndustry$ && this.subscriptions$.push(queryIndustry$);
    }

    const projects$ = this.route.data.pipe(map(r => r["data"])).subscribe(projects => {
      this.projectsCount = projects.count;

      this.projects = projects.results ?? [];
      this.searchedProjects = projects.results ?? [];
    });

    projects$ && this.subscriptions$.push(projects$);
  }

  ngAfterViewInit(): void {
    const target = document.querySelector(".office__body");
    if (target) {
      const scrollEvent$ = fromEvent(target, "scroll")
        .pipe(
          concatMap(() => this.onScroll()),
          throttleTime(500)
        )
        .subscribe(noop);
      this.subscriptions$.push(scrollEvent$);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $?.unsubscribe());
  }

  private buildFilterQuery(q: Params): Record<string, string> {
    const reqQuery: Record<string, any> = {};

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

    return reqQuery;
  }

  isFilterOpen = false;

  isAll = location.href.includes("/all");
  isMy = location.href.includes("/my");
  isSubs = location.href.includes("/subscriptions");

  profile?: User;
  profileProjSubsIds?: number[];
  subscriptions$: Subscription[] = [];

  projectsCount = 0;
  currentPage = 1;
  projectsPerFetch = 15;
  projects: Project[] = [];
  searchedProjects: Project[] = [];

  @ViewChild("listRoot") listRoot?: ElementRef<HTMLElement>;

  private previousReqQuery: Record<string, any> = {};

  deleteProject(projectId: number): void {
    if (!confirm("Вы точно хотите удалить проект?")) {
      return;
    }

    this.projectService.remove(projectId).subscribe(() => {
      this.projectService.projectsCount.next({
        ...this.projectService.projectsCount.getValue(),
        my: this.projectService.projectsCount.getValue().my - 1,
      });

      const index = this.projects.findIndex(project => project.id === projectId);
      this.projects.splice(index, 1);
    });
  }

  addProject(): void {
    this.projectService.create().subscribe(project => {
      this.projectService.projectsCount.next({
        ...this.projectService.projectsCount.getValue(),
        my: this.projectService.projectsCount.getValue().my + 1,
      });

      this.router
        .navigateByUrl(`/office/projects/${project.id}/edit`)
        .then(() => console.debug("Route change from ProjectsComponent"));
    });
  }

  onScroll() {
    if (this.isSubs) {
      return of({});
    }

    if (this.projectsCount && this.projects.length >= this.projectsCount) return of({});

    const target = document.querySelector(".office__body");
    if (!target || !this.listRoot) return of({});

    const diff =
      target.scrollTop -
      this.listRoot.nativeElement.getBoundingClientRect().height +
      window.innerHeight;

    if (diff > 0) {
      // const search = { fullname: this.searchParamSubject$.value };
      return this.onFetch(this.currentPage * this.projectsPerFetch, this.projectsPerFetch).pipe(
        tap(chunk => {
          this.currentPage++;
          this.projects = [...this.projects, ...chunk];
          this.searchedProjects = this.projects;

          this.cdref.detectChanges();
        })
      );
    }

    return of({});
  }

  onFetch(skip: number, take: number) {
    if (this.isAll) {
      const queries = this.route.snapshot.queryParams;

      return this.projectService
        .getAll(
          new HttpParams({
            fromObject: { offset: skip, limit: take, ...this.buildFilterQuery(queries) },
          })
        )
        .pipe(
          map((projects: ApiPagination<Project>) => {
            this.searchedProjects = projects.results;

            return projects.results;
          })
        );
    } else {
      return this.projectService.getMy().pipe(
        map((projects: ApiPagination<Project>) => {
          this.projectsCount = projects.count;
          return projects.results;
        })
      );
    }
  }
  // return this.memberService.getMembers(skip, take, params).pipe(
  //   map((members: MembersResult) => {
  //     this.membersTotalCount = members.count;
  //
  //     return members.results;
  //   })
  // );
  // }
}
