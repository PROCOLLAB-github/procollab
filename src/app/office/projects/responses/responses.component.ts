/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { map, Observable, Subscription } from "rxjs";
import { VacancyResponse } from "../../models/vacancy-response.model";
import { VacancyService } from "../../services/vacancy.service";

@Component({
  selector: "app-responses",
  templateUrl: "./responses.component.html",
  styleUrls: ["./responses.component.scss"],
})
export class ProjectResponsesComponent implements OnInit, OnDestroy {
  constructor(private route: ActivatedRoute, private vacancyService: VacancyService) {}

  ngOnInit(): void {
    this.responses$ = this.route.data
      .pipe(map(r => r["data"]))
      .subscribe((responses: VacancyResponse[]) => {
        this.responses = responses.filter(response => response.isApproved !== false);
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
