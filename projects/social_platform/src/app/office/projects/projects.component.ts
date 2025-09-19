/** @format */

import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from "@angular/core";
import { NavService } from "@services/nav.service";
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { map, Subscription } from "rxjs";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { SearchComponent } from "@ui/components/search/search.component";
import { ButtonComponent, IconComponent } from "@ui/components";
import { BarNewComponent } from "@ui/components/bar-new/bar.component";
import { BackComponent } from "@uilib";
import { SoonCardComponent } from "@office/shared/soon-card/soon-card.component";
import { ProjectsFilterComponent } from "./projects-filter/projects-filter.component";
import { Project } from "@office/models/project.model";
import { inviteToProjectMapper } from "@utils/inviteToProjectMapper";
import { ProjectsService } from "./services/projects.service";
import { InfoCardComponent } from "@office/shared/info-card/info-card.component";

/**
 * Главный компонент модуля проектов
 * Управляет отображением списка проектов, поиском и созданием новых проектов
 *
 * Принимает:
 * - Счетчики проектов через резолвер
 * - Параметры поиска из URL
 *
 * Возвращает:
 * - Интерфейс управления проектами с поиском и фильтрацией
 * - Навигацию между разделами "Мои", "Все", "Подписки"
 */
@Component({
  selector: "app-projects",
  templateUrl: "./projects.component.html",
  styleUrl: "./projects.component.scss",
  standalone: true,
  imports: [
    IconComponent,
    ReactiveFormsModule,
    SearchComponent,
    ButtonComponent,
    RouterOutlet,
    BarNewComponent,
    BackComponent,
    SoonCardComponent,
    ProjectsFilterComponent,
    InfoCardComponent,
  ],
})
export class ProjectsComponent implements OnInit, OnDestroy {
  constructor(
    private readonly navService: NavService,
    private readonly route: ActivatedRoute,
    private readonly projectsService: ProjectsService,
    private readonly router: Router,
    private readonly renderer: Renderer2,
    private readonly fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      search: [""],
    });
  }

  @ViewChild("filterBody") filterBody!: ElementRef<HTMLElement>;

  ngOnInit(): void {
    this.navService.setNavTitle("Проекты");

    this.route.data.pipe(map(r => r["data"])).subscribe({
      next: invites => {
        this.myInvites = inviteToProjectMapper(invites.slice(0, 1));
      },
    });

    const searchFormSearch$ = this.searchForm.get("search")?.valueChanges.subscribe(search => {
      this.router
        .navigate([], {
          queryParams: { name__contains: search },
          relativeTo: this.route,
          queryParamsHandling: "merge",
        })
        .then(() => console.debug("QueryParams changed from ProjectsComponent"));
    });

    searchFormSearch$ && this.subscriptions$.push(searchFormSearch$);

    const routeUrl$ = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isMy = location.href.includes("/my");
        this.isAll = location.href.includes("/all");
        this.isSubs = location.href.includes("/subscriptions");
        this.isInvites = location.href.includes("/invites");
        this.isDashboard = location.href.includes("/dashboard");
      }
    });
    routeUrl$ && this.subscriptions$.push(routeUrl$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $?.unsubscribe());
  }

  searchForm: FormGroup;

  myInvites: Project[] = [];

  subscriptions$: Subscription[] = [];

  isMy = location.href.includes("/my");
  isAll = location.href.includes("/all");
  isSubs = location.href.includes("/subscriptions");
  isInvites = location.href.includes("/invites");
  isDashboard = location.href.includes("/dashboard");

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

  addProject(): void {
    this.projectsService.addProject();
  }
}
