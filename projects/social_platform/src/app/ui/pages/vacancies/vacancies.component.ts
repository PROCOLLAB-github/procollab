/** @format */

// vacancies.component.ts
/** @format */

import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BarComponent } from "@ui/components";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { BackComponent } from "@uilib";
import { SearchComponent } from "@ui/components/search/search.component";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { debounceTime, distinctUntilChanged, tap } from "rxjs";
import { VacancyFilterComponent } from "@ui/components/vacancy-filter/vacancy-filter.component";

@Component({
  selector: "app-vacancies",
  standalone: true,
  imports: [
    CommonModule,
    BarComponent,
    RouterOutlet,
    BackComponent,
    SearchComponent,
    VacancyFilterComponent,
    ReactiveFormsModule,
  ],
  templateUrl: "./vacancies.component.html",
  styleUrl: "./vacancies.component.scss",
})
export class VacanciesComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  fb = inject(FormBuilder);

  searchForm: FormGroup;

  basePath = "/office/";

  get isAll(): boolean {
    return this.router.url.includes("/vacancies/all");
  }

  get isMy(): boolean {
    return this.router.url.includes("/vacancies/my");
  }

  constructor() {
    this.searchForm = this.fb.group({
      search: [""],
    });
  }

  ngOnInit() {
    this.searchForm
      .get("search")
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(value => {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { role_contains: value || null },
            queryParamsHandling: "merge",
          });
        })
      )
      .subscribe();
  }

  onSearchSubmit() {
    const value = this.searchForm.get("search")?.value;
    this.router.navigate([], {
      queryParams: { role_contains: value || null },
      queryParamsHandling: "merge",
      relativeTo: this.route,
    });
  }

  onSearhValueChanged(event: string) {
    this.searchForm.get("search")?.setValue(event);
  }
}
