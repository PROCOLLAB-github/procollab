/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";

@Injectable({ providedIn: "root" })
export class PathsService {
  private readonly router = inject(Router);

  readonly basePath = signal("/office/");
  readonly url = signal(this.router.url);

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.url.set(this.router.url);
    });
  }

  readonly isAllVacanciesPage = computed(() => this.url().includes("/vacancies/all"));

  readonly isMyVacanciesPage = computed(() => this.url().includes("/vacancies/my"));
}
