/** @format */

import { animate, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ButtonComponent, CheckboxComponent, IconComponent } from "@ui/components";
import { ClickOutsideModule } from "ng-click-outside";
import { BehaviorSubject, Subscription } from "rxjs";

@Component({
  selector: "app-feed-filter",
  standalone: true,
  imports: [CommonModule, CheckboxComponent, ButtonComponent, ClickOutsideModule, IconComponent],
  templateUrl: "./feed-filter.component.html",
  styleUrl: "./feed-filter.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("dropdownAnimation", [
      transition(":enter", [
        style({ opacity: 0, transform: "scaleY(0.8)" }),
        animate(".12s cubic-bezier(0, 0, 0.2, 1)"),
      ]),
      transition(":leave", [animate(".1s linear", style({ opacity: 0 }))]),
    ]),
  ],
})
export class FeedFilterComponent {
  constructor(private readonly router: Router, private readonly route: ActivatedRoute) {}

  filterOpen = false;

  filterOptions = [
    { label: "Личные новости", value: "profile-news" },
    { label: "Проектные новости", value: "project-news" },
    { label: "Вакансии", value: "vacancies" },
    { label: "Новые проекты", value: "new-projects" },
  ];

  includedFilters$ = new BehaviorSubject<Set<string>>(new Set());

  subscriptions: Subscription[] = [];

  applyFilter(): void {
    const included = this.includedFilters$.value;

    this.router
      .navigate([], {
        queryParams: { includes: [...Array.from(included)] },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Query change from FeedFilterComponent"));
  }

  setFilter(keyword: string): void {
    const included = this.includedFilters$.value;

    included.has(keyword) ? included.delete(keyword) : included.add(keyword);

    this.includedFilters$.next(included);
  }

  resetFilter(): void {
    this.includedFilters$.next(new Set());

    this.applyFilter();
  }

  onClickOutside(): void {
    this.filterOpen = false;
  }
}
