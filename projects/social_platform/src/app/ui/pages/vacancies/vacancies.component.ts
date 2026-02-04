/** @format */

// vacancies.component.ts
/** @format */

import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterOutlet } from "@angular/router";
import { BackComponent } from "@uilib";
import { SearchComponent } from "@ui/components/search/search.component";
import { ReactiveFormsModule } from "@angular/forms";
import { VacancyFilterComponent } from "@ui/components/vacancy-filter/vacancy-filter.component";
import { VacancyInfoService } from "../../../api/vacancy/facades/vacancy-info.service";
import { VacancyUIInfoService } from "../../../api/vacancy/facades/ui/vacancy-ui-info.service";

@Component({
  selector: "app-vacancies",
  templateUrl: "./vacancies.component.html",
  styleUrl: "./vacancies.component.scss",
  imports: [
    CommonModule,
    RouterOutlet,
    BackComponent,
    SearchComponent,
    VacancyFilterComponent,
    ReactiveFormsModule,
  ],
  providers: [VacancyInfoService, VacancyUIInfoService],
  standalone: true,
})
export class VacanciesComponent implements OnInit {
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
