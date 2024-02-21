/** @format */

import { animate, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ButtonComponent, CheckboxComponent, IconComponent } from "@ui/components";
import { ClickOutsideModule } from "ng-click-outside";

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
  router = inject(Router);
  route = inject(ActivatedRoute);

  filterOpen = signal(false);

  filterOptions = [
    { label: "Новости", value: "news" },
    { label: "Вакансии", value: "vacancy" },
    { label: "Новые проекты", value: "project" },
  ];

  includedFilters = signal<Set<string>>(new Set([]));

  applyFilter(): void {
    this.router
      .navigate([], {
        queryParams: { includes: [...Array.from(this.includedFilters())] },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Query change from FeedFilterComponent"));
  }

  setFilter(keyword: string): void {
    this.includedFilters.update(included => {
      included.has(keyword) ? included.delete(keyword) : included.add(keyword);
      return included;
    });
  }

  resetFilter(): void {
    this.includedFilters.set(new Set());

    this.applyFilter();
  }

  onClickOutside(): void {
    this.filterOpen.set(false);
  }
}
