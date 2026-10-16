/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { BackComponent } from "@uilib";
import { VacancyDetailInfoService } from "@api/vacancy/facades/vacancy-detail-info.service";
import { VacancyDetailUIInfoService } from "@api/vacancy/facades/ui/vacancy-detail-ui-info.service";
import { ExpandService } from "@api/expand/expand.service";
import { RouterLink, RouterOutlet } from "@angular/router";
import { AppRoutes } from "@api/paths/app-routes";
import { CapitalizePipe, SalaryTransformPipe } from "@corelib";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { VacancyStatusComponent } from "@ui/widgets/vacancy-status/vacancy-status.component";

/** Контейнер детальной страницы вакансии с навигацией и router-outlet. */
@Component({
  selector: "app-vacancies-detail",
  templateUrl: "./vacancies-detail.component.html",
  styleUrl: "./vacancies-detail.component.scss",
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    BackComponent,
    AvatarComponent,
    VacancyStatusComponent,
    CapitalizePipe,
    SalaryTransformPipe,
  ],
  providers: [VacancyDetailInfoService, VacancyDetailUIInfoService, ExpandService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacanciesDetailComponent implements OnInit {
  protected readonly AppRoutes = AppRoutes;
  private readonly vacancyDetailInfoService = inject(VacancyDetailInfoService);
  private readonly vacancyDetailUIInfoService = inject(VacancyDetailUIInfoService);

  protected readonly vacancy = this.vacancyDetailUIInfoService.vacancy;

  ngOnInit(): void {
    this.vacancyDetailInfoService.initializeDetailInfo();
  }
}
