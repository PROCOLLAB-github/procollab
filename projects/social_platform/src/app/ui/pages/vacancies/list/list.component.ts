/** @format */

import { DesktopLayoutService, StateComponent } from "@uilib";
/** @format */

// list.component.ts
/** @format */

import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { ButtonComponent, IconComponent } from "@ui/primitives";
import { isSuccess } from "@domain/shared/async-state";
import { ProjectVacancyCardComponent } from "@ui/widgets/project-vacancy-card/project-vacancy-card.component";
import { ResponseCardComponent } from "./response-card/response-card.component";
import { VacancyUIInfoService } from "@api/vacancy/facades/ui/vacancy-ui-info.service";
import { VacancyInfoService } from "@api/vacancy/facades/vacancy-info.service";
import { AppRoutes } from "@api/paths/app-routes";

/** Страница списка вакансий. */
@Component({
  selector: "app-vacancies-list",
  templateUrl: "./list.component.html",
  styleUrl: "./list.component.scss",
  imports: [
    StateComponent,
    CommonModule,
    ResponseCardComponent,
    ProjectVacancyCardComponent,
    IconComponent,
    RouterLink,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [VacancyInfoService, VacancyUIInfoService],
})
export class VacanciesListComponent {
  protected readonly desktopLayout = inject(DesktopLayoutService).desktop;
  private readonly vacancyInfoService = inject(VacancyInfoService);
  private readonly vacancyUIInfoService = inject(VacancyUIInfoService);
  private readonly route = inject(ActivatedRoute);
  private readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly type = this.vacancyUIInfoService.listType;
  protected readonly vacancyList = this.vacancyUIInfoService.vacancyList;
  protected readonly hasNoResults = computed(
    () => isSuccess(this.vacancyUIInfoService.vacancies$()) && !this.vacancyList().length,
  );
  protected readonly hasFilters = computed(() =>
    ["role_contains", "required_experience", "work_format", "work_schedule", "salary"].some(key =>
      this.queryParams()
        .getAll(key)
        .some(value => value.trim().length > 0),
    ),
  );
  protected readonly responsesList = this.vacancyUIInfoService.responsesList;
  protected readonly isMyModal = this.vacancyUIInfoService.isMyModal;

  protected readonly AppRoutes = AppRoutes;

  ngOnInit() {
    this.vacancyInfoService.init();
  }

  ngAfterViewInit() {
    const target = document.querySelector(".office__body") as HTMLElement;
    if (target) {
      this.vacancyInfoService.initScroll(target);
    }
  }

  ngOnDestroy() {
    this.vacancyInfoService.destroy();
  }
}
