/** @format */

import { animate, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ButtonComponent, CheckboxComponent, IconComponent } from "@ui/components";
import { ClickOutsideModule } from "ng-click-outside";
import { FeedService } from "@office/feed/services/feed.service";

@Component({
  selector: "app-vacancy-filter",
  standalone: true,
  imports: [CommonModule, CheckboxComponent, ButtonComponent, ClickOutsideModule, IconComponent],
  templateUrl: "./vacancy-filter.component.html",
  styleUrl: "./vacancy-filter.component.scss",
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
export class VacancyFilterComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  feedService = inject(FeedService);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      params["includes"] &&
        this.includedFilters.set(params["includes"].split(this.feedService.FILTER_SPLIT_SYMBOL));
    });
  }

  filterOpen = signal(false);

  filterOptions = [
    { label: "Недавние", value: "recent" },
    { label: "Просмотренные", value: "viewed" },
    { label: "С откликом", value: "clicked" },
    { label: "Без откликом", value: "non_clicked" },
  ];

  includedFilters = signal<string[]>([]);

  applyFilter(): void {
    this.router
      .navigate([], {
        queryParams: {
          includes: this.includedFilters().join(this.feedService.FILTER_SPLIT_SYMBOL),
        },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Query change from FeedFilterComponent"));
  }

  setFilter(keyword: string): void {
    this.includedFilters.update(included => {
      if (included.indexOf(keyword) !== -1) {
        const idx = included.indexOf(keyword);
        included.splice(idx, 1);
      } else {
        included.push(keyword);
      }

      return included;
    });
  }

  resetFilter(): void {
    this.includedFilters.set([]);

    this.applyFilter();
  }

  onClickOutside(): void {
    this.filterOpen.set(false);
  }
}
