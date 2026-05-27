/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { BarComponent } from "@ui/primitives";
import { map, Subscription } from "rxjs";
import { BackComponent } from "@uilib";
import { VacancyDetailInfoService } from "@api/vacancy/facades/vacancy-detail-info.service";
import { VacancyDetailUIInfoService } from "@api/vacancy/facades/ui/vacancy-detail-ui-info.service";
import { ExpandService } from "@api/expand/expand.service";

/** Контейнер детальной страницы вакансии с навигацией и router-outlet. */
@Component({
  selector: "app-vacancies-detail",
  templateUrl: "./vacancies-detail.component.html",
  styleUrl: "./vacancies-detail.component.scss",
  imports: [CommonModule, BarComponent, RouterOutlet, BackComponent],
  providers: [VacancyDetailInfoService, VacancyDetailUIInfoService, ExpandService],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacanciesDetailComponent implements OnInit, OnDestroy {
  private readonly vacancyDetailInfoService = inject(VacancyDetailInfoService);
  private readonly vacancyDetailUIInfoService = inject(VacancyDetailUIInfoService);

  protected readonly vacancy = this.vacancyDetailUIInfoService.vacancy;

  ngOnInit(): void {
    this.vacancyDetailInfoService.initializeDetailInfo();
  }

  ngOnDestroy(): void {
    this.vacancyDetailInfoService.destroy();
  }
}
