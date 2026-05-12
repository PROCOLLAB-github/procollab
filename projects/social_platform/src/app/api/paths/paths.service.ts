/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";
import { AppRoutes } from "./app-routes";

@Injectable({ providedIn: "root" })
export class PathsService {
  private readonly router = inject(Router);

  readonly basePath = signal(AppRoutes.office.root);
  readonly url = signal(this.router.url);

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.url.set(this.router.url);
    });
  }

  readonly isAllVacanciesPage = computed(() => this.url().includes(AppRoutes.office.vacancies()));

  readonly isMyVacanciesPage = computed(() => this.url().includes(AppRoutes.office.vacanciesMy()));
}
