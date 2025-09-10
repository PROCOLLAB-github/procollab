/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavService } from "@services/nav.service";
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { Subscription } from "rxjs";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { SearchComponent } from "@ui/components/search/search.component";
import { BarComponent } from "@ui/components";
import { ProgramService } from "./services/program.service";
import { BackComponent } from "@uilib";

/**
 * Основной компонент модуля "Программы"
 *
 * Функциональность:
 * - Отображает заголовок навигации "Программы"
 * - Предоставляет форму поиска программ
 * - Управляет состоянием активных вкладок (My/All)
 * - Обрабатывает изменения поисковых параметров в URL
 * - Содержит router-outlet для дочерних компонентов
 *
 * Принимает:
 * - NavService - для установки заголовка навигации
 * - ActivatedRoute - для работы с параметрами маршрута
 * - ProgramService - сервис для работы с программами
 * - Router - для навигации и изменения URL параметров
 * - FormBuilder - для создания реактивных форм
 *
 * Возвращает:
 * - HTML шаблон с формой поиска и router-outlet
 * - Управляет состоянием флагов isMy и isAll
 */
@Component({
  selector: "app-program",
  templateUrl: "./program.component.html",
  styleUrl: "./program.component.scss",
  standalone: true,
  imports: [ReactiveFormsModule, SearchComponent, RouterOutlet, BarComponent, BackComponent],
})
export class ProgramComponent implements OnInit, OnDestroy {
  constructor(
    private readonly navService: NavService,
    private readonly route: ActivatedRoute,
    public readonly programService: ProgramService,
    private readonly router: Router,
    private readonly fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      search: [""],
    });
  }

  ngOnInit(): void {
    this.navService.setNavTitle("Программы");

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

    const routeUrl$ = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isMy = location.href.includes("/my");
        this.isAll = location.href.includes("/all");
      }
    });
    routeUrl$ && this.subscriptions$.push(routeUrl$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $?.unsubscribe());
  }

  searchForm: FormGroup;
  subscriptions$: Subscription[] = [];

  isMy = location.href.includes("/my");
  isAll = location.href.includes("/all");
}
