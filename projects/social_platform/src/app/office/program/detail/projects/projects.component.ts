/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Params, Router, RouterLink } from "@angular/router";
import {
  catchError,
  concatMap,
  distinctUntilChanged,
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
import { AsyncPipe, CommonModule } from "@angular/common";
import { ProgramService } from "@office/program/services/program.service";
import { AuthService } from "@auth/services";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { SearchComponent } from "@ui/components/search/search.component";
import Fuse from "fuse.js";
import { ProjectsFilterComponent } from "@office/program/detail/projects/projects-filter/projects-filter.component";
import { HttpParams } from "@angular/common/http";
import { IconComponent } from "@uilib";
import { PartnerProgramFields } from "@office/models/partner-program-fields.model";

/**
 * Компонент списка проектов программы
 *
 * Отображает все проекты, связанные с программой, с поддержкой:
 * - Бесконечной прокрутки (infinite scroll)
 * - Пагинации данных
 * - Модального окна для оценки проектов (для экспертов)
 *
 * Принимает:
 * @param {ActivatedRoute} route - Для получения данных из резолвера
 * @param {ProgramService} programService - Сервис для загрузки проектов
 * @param {AuthService} authService - Для проверки прав пользователя
 *
 * Данные:
 * @property {Project[]} projects - Массив проектов программы
 * @property {number} projectsTotalCount - Общее количество проектов
 * @property {Observable<Program>} program$ - Поток данных программы
 * @property {number} page - Текущая страница пагинации
 * @property {number} perPage - Количество проектов на странице
 * @property {boolean} isFilterOpen - состояние панели фильтров (мобильные)
 * ViewChild:
 * @ViewChild projectsRoot - Ссылка на DOM элемент списка проектов
 *
 * Функциональность:
 * - Загрузка начальных данных из резолвера
 * - Автоматическая подгрузка при прокрутке
 * - Отображение карточек проектов
 * - Интеграция с компонентом оценки проектов
 *
 * Методы:
 * @method onScroll() - Обработчик прокрутки для подгрузки данных
 * @method onFetch() - Загрузка следующей порции проектов
 *
 * Возвращает:
 * HTML шаблон со списком проектов и элементами управления
 */
@Component({
  selector: "app-projects",
  templateUrl: "./projects.component.html",
  styleUrl: "./projects.component.scss",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProgramHeadComponent,
    RouterLink,
    ProjectCardComponent,
    IconComponent,
    AsyncPipe,
    SearchComponent,
    ProjectsFilterComponent,
  ],
})
export class ProgramProjectsComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly cdref: ChangeDetectorRef,
    private readonly programService: ProgramService,
    public readonly authService: AuthService,
    private readonly renderer: Renderer2
  ) {
    this.searchForm = this.fb.group({
      search: [""],
    });
  }

  @ViewChild("projectsRoot") projectsRoot?: ElementRef<HTMLElement>;
  @ViewChild("filterBody") filterBody!: ElementRef<HTMLElement>;

  projectsTotalCount?: number;
  page = 1;
  perPage = 21;

  projects: Project[] = [];
  searchedProjects: Project[] = [];

  program$?: Observable<Program> = this.route.parent?.data.pipe(map(r => r["data"]));

  searchForm: FormGroup;
  subscriptions$: Subscription[] = [];

  private previousReqQuery: Record<string, any> = {};
  private availableFilters: PartnerProgramFields[] = [];

  ngOnInit(): void {
    const routeData$ = this.route.data
      .pipe(
        map(r => r["data"]),
        tap(r => (this.projectsTotalCount = r["count"])),
        map(r => r["results"])
      )
      .subscribe(projects => {
        this.projects = projects;
        this.searchedProjects = projects;
      });

    const searchFormSearch$ = this.searchForm.get("search")?.valueChanges.subscribe(search => {
      this.router
        .navigate([], {
          queryParams: { search },
          relativeTo: this.route,
          queryParamsHandling: "merge",
        })
        .then(() => console.debug("QueryParams changed from ProjectsComponent"));
    });

    searchFormSearch$ && this.subscriptions$.push(searchFormSearch$);

    const querySearch$ = this.route.queryParams.pipe(map(q => q["search"])).subscribe(search => {
      const fuse = new Fuse(this.projects, {
        keys: ["name"],
      });

      this.searchedProjects = search ? fuse.search(search).map(el => el.item) : this.projects;
    });

    querySearch$ && this.subscriptions$.push(querySearch$);

    const observable = this.route.queryParams.pipe(
      distinctUntilChanged(),
      concatMap(q => {
        const reqQuery = this.buildFilterQuery(q);
        const programId = this.route.parent?.snapshot.params["programId"];

        if (JSON.stringify(reqQuery) !== JSON.stringify(this.previousReqQuery)) {
          this.previousReqQuery = reqQuery;

          const hasFilters =
            reqQuery && reqQuery["filters"] && Object.keys(reqQuery["filters"]).length > 0;

          const params = new HttpParams({ fromObject: { partner_program: programId } });

          if (hasFilters) {
            return this.programService.createProgramFilters(programId, reqQuery["filters"]).pipe(
              catchError(err => {
                console.error("createFilters failed, fallback to getAllProjects()", err);
                return this.programService.getAllProjects(params);
              })
            );
          }

          return this.programService.getAllProjects(params).pipe(
            catchError(err => {
              console.error("getAllProjects failed", err);
              return this.programService.getAllProjects(params);
            })
          );
        }

        this.previousReqQuery = reqQuery;
        return of(0);
      })
    );

    const projects$ = observable.subscribe(projects => {
      if (typeof projects === "number") return;

      this.projects = projects.results;
      this.searchedProjects = projects.results;

      this.cdref.detectChanges();
    });

    projects$ && this.subscriptions$.push(projects$);

    this.subscriptions$.push(routeData$);
  }

  ngAfterViewInit() {
    const target = document.querySelector(".office__body");
    if (!target) return;

    const scroll$ = fromEvent(target, "scroll")
      .pipe(
        throttleTime(500),
        concatMap(() => this.onScroll())
      )
      .subscribe(noop);
    this.subscriptions$.push(scroll$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

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

  onFiltersLoaded(filters: PartnerProgramFields[]): void {
    this.availableFilters = filters;
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
    const programId = this.route.parent?.snapshot.params["programId"];
    const offset = this.page * this.perPage;
    const limit = this.perPage;

    return this.programService
      .getAllProjects(new HttpParams({ fromObject: { partner_program: programId, offset, limit } }))
      .pipe(
        tap(projects => {
          this.projectsTotalCount = projects.count;
          this.projects = [...this.projects, ...projects.results];
          this.searchedProjects = this.projects;

          this.page++;

          this.cdref.detectChanges();
        })
      );
  }

  private buildFilterQuery(q: Params): Record<string, any> {
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
}
