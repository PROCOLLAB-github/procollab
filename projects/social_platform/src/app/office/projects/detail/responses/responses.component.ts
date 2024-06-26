/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Observable, Subscription } from "rxjs";
import { VacancyResponse } from "@models/vacancy-response.model";
import { VacancyService } from "@services/vacancy.service";
import { NavService } from "@services/nav.service";
import { ResponseCardComponent } from "@office/shared/response-card/response-card.component";

@Component({
  selector: "app-responses",
  templateUrl: "./responses.component.html",
  styleUrl: "./responses.component.scss",
  standalone: true,
  imports: [ResponseCardComponent],
})
export class ProjectResponsesComponent implements OnInit, OnDestroy {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly vacancyService: VacancyService,
    private readonly navService: NavService
  ) {}

  ngOnInit(): void {
    this.navService.setNavTitle("Профиль проекта");

    this.responses$ = this.route.data
      .pipe(map(r => r["data"]))
      .subscribe((responses: VacancyResponse[]) => {
        this.responses = responses.filter(response => response.isApproved === null);
      });
  }

  ngOnDestroy(): void {
    this.responses$?.unsubscribe();
  }

  projectId: Observable<number> = this.route.params.pipe(
    map(r => r["projectId"]),
    map(Number)
  );

  responses$?: Subscription;
  responses: VacancyResponse[] = [];

  acceptResponse(responseId: number) {
    this.vacancyService.acceptResponse(responseId).subscribe(() => {
      const index = this.responses.findIndex(el => el.id === responseId);
      this.responses.splice(index, 1);
    });
  }

  rejectResponse(responseId: number) {
    this.vacancyService.rejectResponse(responseId).subscribe(() => {
      const index = this.responses.findIndex(el => el.id === responseId);
      this.responses.splice(index, 1);
    });
  }
}
