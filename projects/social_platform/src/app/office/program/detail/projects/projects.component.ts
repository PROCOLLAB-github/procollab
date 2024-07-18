/** @format */

import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import {
  concatMap,
  fromEvent,
  map,
  noop,
  Observable,
  of,
  Subscription,
  tap,
  throttleTime,
} from "rxjs";
import { Project } from "@models/project.model";
import { Program } from "@office/program/models/program.model";
import { ProjectCardComponent } from "@office/shared/project-card/project-card.component";
import { ProgramHeadComponent } from "../../shared/program-head/program-head.component";
import { AsyncPipe, JsonPipe } from "@angular/common";
import { ProgramService } from "@office/program/services/program.service";
import { ProjectRatingComponent } from "@office/shared/project-rating/project-rating.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { ButtonComponent } from "@ui/components";
import { AuthService } from "@auth/services";

@Component({
  selector: "app-projects",
  templateUrl: "./projects.component.html",
  styleUrl: "./projects.component.scss",
  standalone: true,
  imports: [
    ProgramHeadComponent,
    RouterLink,
    ProjectCardComponent,
    AsyncPipe,
    JsonPipe,
    ProjectRatingComponent,
    ModalComponent,
    ButtonComponent,
  ],
})
export class ProgramProjectsComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly programService: ProgramService,
    public readonly authService: AuthService,
  ) {}

  @ViewChild("projectsRoot") projectsRoot?: ElementRef<HTMLElement>;

  projectsTotalCount?: number;
  page = 1;
  perPage = 21;

  projects: Project[] = [];

  program$?: Observable<Program> = this.route.parent?.data.pipe(map(r => r["data"]));

  subscriptions$: Subscription[] = [];

  ngOnInit(): void {
    const routeData$ = this.route.data
      .pipe(
        map(r => r["data"]),
        tap(r => (this.projectsTotalCount = r["count"])),
        map(r => r["results"]),
      )
      .subscribe(projects => {
        this.projects = projects;
      });

    this.subscriptions$.push(routeData$);
  }

  ngAfterViewInit() {
    const target = document.querySelector(".office__body");
    if (!target) return;

    const scroll$ = fromEvent(target, "scroll")
      .pipe(
        throttleTime(500),
        concatMap(() => this.onScroll()),
      )
      .subscribe(noop);
    this.subscriptions$.push(scroll$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  private onScroll() {
    if (this.projectsTotalCount && this.projects.length >= this.projectsTotalCount) return of({});

    const target = document.querySelector(".office__body");
    if (!target || !this.projectsRoot) return of({});

    const diff =
      target.scrollTop -
      this.projectsRoot.nativeElement.getBoundingClientRect().height +
      window.innerHeight;

    if (diff > -200) {
      return this.onFetch();
    }

    return of({});
  }

  private onFetch() {
    return this.programService
      .getAllProjects(
        this.route.parent?.snapshot.params["programId"],
        this.page * this.perPage,
        this.perPage,
      )
      .pipe(
        tap(projects => {
          this.projectsTotalCount = projects.count;
          this.projects = [...this.projects, ...projects.results];

          this.page++;
        }),
      );
  }
}
