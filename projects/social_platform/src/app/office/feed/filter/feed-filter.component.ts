/** @format */

import { animate, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ButtonComponent, CheckboxComponent, IconComponent } from "@ui/components";
import { ClickOutsideModule } from "ng-click-outside";
import { FeedService } from "@office/feed/services/feed.service";
import { User } from "@auth/models/user.model";
import { AuthService } from "@auth/services";
import { Subscription } from "rxjs";

@Component({
  selector: "app-feed-filter",
  standalone: true,
  imports: [
    CommonModule,
    CheckboxComponent,
    ButtonComponent,
    ClickOutsideModule,
    IconComponent,
    RouterLink,
  ],
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
export class FeedFilterComponent implements OnInit, OnDestroy {
  router = inject(Router);
  route = inject(ActivatedRoute);
  authService = inject(AuthService);
  feedService = inject(FeedService);

  profile = signal<User | null>(null);
  subscriptions: Subscription[] = [];

  ngOnInit() {
    const profileSubscription = this.authService.profile.subscribe(profile => {
      this.profile.set(profile);
    });

    this.route.queryParams.subscribe(params => {
      params["includes"] &&
        this.includedFilters.set(params["includes"].split(this.feedService.FILTER_SPLIT_SYMBOL));
    });

    this.subscriptions.push(profileSubscription);
  }

  ngOnDestroy(): void {
      this.subscriptions.forEach($ => $.unsubscribe());
  }

  filterOpen = signal(false);

  filterOptions = [
    { label: "Новости", value: "news" },
    { label: "Вакансии", value: "vacancy" },
    { label: "Новые проекты", value: "project" },
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
