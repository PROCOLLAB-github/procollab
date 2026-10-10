/** @format */

import { inject as injectReleaseLayout } from "@angular/core";
import { DesktopLayoutService as ReleaseDesktopLayoutService } from "../../../../../../ui/src/lib/services/desktop-layout.service";

// vacancies.component.ts

import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterOutlet } from "@angular/router";
import { BackComponent, FormLayoutDirective, PageHeaderComponent } from "@uilib";
import { SearchComponent } from "@ui/primitives/search/search.component";
import { ReactiveFormsModule } from "@angular/forms";
import { VacancyFilterComponent } from "@ui/widgets/vacancy-filter/vacancy-filter.component";
import { VacancyInfoService } from "@api/vacancy/facades/vacancy-info.service";
import { VacancyUIInfoService } from "@api/vacancy/facades/ui/vacancy-ui-info.service";
import { AppRoutes } from "@api/paths/app-routes";

/** Раздел вакансий: shell с router-outlet. */
@Component({
  selector: "app-vacancies",
  templateUrl: "./vacancies.component.html",
  styleUrl: "./vacancies.component.scss",
  imports: [
    PageHeaderComponent,
    FormLayoutDirective,
    CommonModule,
    RouterOutlet,
    BackComponent,
    SearchComponent,
    VacancyFilterComponent,
    ReactiveFormsModule,
  ],
  providers: [VacancyInfoService, VacancyUIInfoService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacanciesComponent implements OnInit {
  protected readonly releaseDesktop = injectReleaseLayout(ReleaseDesktopLayoutService).desktop;

  protected readonly AppRoutes = AppRoutes;
  private readonly vacancyInfoService = inject(VacancyInfoService);
  private readonly vacancyUIInfoService = inject(VacancyUIInfoService);

  protected readonly searchForm = this.vacancyUIInfoService.searchForm;
  protected readonly isAll = this.vacancyUIInfoService.listType;
  protected readonly basePath = "/office/";

  ngOnInit() {
    this.vacancyInfoService.initializationSearchValueForm();
    this.vacancyInfoService.init();
  }

  ngOnDestroy(): void {
    this.vacancyInfoService.destroy();
  }

  onSearchSubmit() {
    this.vacancyInfoService.onSearchSubmit();
  }

  onSearhValueChanged(event: string) {
    this.vacancyUIInfoService.applySearhValueChanged(event);
  }
}
