/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, RouterOutlet } from "@angular/router";
import { Project } from "@office/models/project.model";
import { Vacancy } from "@office/models/vacancy.model";
import { BarComponent } from "@ui/components";
import { concatMap, map, Subscription } from "rxjs";

@Component({
  selector: "app-vacancies-detail",
  standalone: true,
  imports: [CommonModule, BarComponent, RouterOutlet],
  templateUrl: "./vacancies-detail.component.html",
  styleUrl: "./vacancies-detail.component.scss",
})
export class VacanciesDetailComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);

  subscriptions$: Subscription[] = [];

  vacancy?: Vacancy;

  ngOnInit(): void {
    const vacancySub$ = this.route.data.pipe(map(r => r["data"])).subscribe(vacancy => {
      console.log(vacancy);
      this.vacancy = vacancy;
    });

    vacancySub$ && this.subscriptions$.push(vacancySub$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }
}
