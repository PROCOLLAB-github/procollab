/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ButtonComponent } from "@ui/components";
import { IconComponent } from "@uilib";
import { map, Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { VacancyResponse } from "@office/models/vacancy-response.model";
import { VacancyService } from "@office/services/vacancy.service";

@Component({
  selector: "app-work-section",
  templateUrl: "./work-section.component.html",
  styleUrl: "./work-section.component.scss",
  imports: [CommonModule, IconComponent, ButtonComponent],
  standalone: true,
})
export class ProjectWorkSectionComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly vacancyService = inject(VacancyService);
  private subscriptions: Subscription[] = [];

  vacancies: VacancyResponse[] = [];

  ngOnInit(): void {
    const vacanciesSub$ = this.route.data.pipe(map(r => r["data"])).subscribe({
      next: (responses: VacancyResponse[]) => {
        this.vacancies = responses.filter(
          (response: VacancyResponse) => response.isApproved === null
        );
      },
    });

    this.subscriptions.push(vacanciesSub$);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach($ => $.unsubscribe());
  }

  /**
   * Принятие отклика на вакансию
   * @param responseId - ID отклика для принятия
   */
  acceptResponse(responseId: number) {
    this.vacancyService.acceptResponse(responseId).subscribe(() => {
      const index = this.vacancies.findIndex(el => el.id === responseId);
      this.vacancies.splice(index, 1);
    });
  }

  /**
   * Отклонение отклика на вакансию
   * @param responseId - ID отклика для отклонения
   */
  rejectResponse(responseId: number) {
    this.vacancyService.rejectResponse(responseId).subscribe(() => {
      const index = this.vacancies.findIndex(el => el.id === responseId);
      this.vacancies.splice(index, 1);
    });
  }
}
