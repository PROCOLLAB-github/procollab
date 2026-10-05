/** @format */

import { ButtonDirective, FiltersDirective } from "@uilib";
/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { IconComponent } from "@ui/primitives";
import { feedFilter } from "@core/consts/filters/feed-filter.const";
import { FeedFilterInfoService } from "./service/feed-filter-info.service";
import { DetailProfileInfoService } from "../detail/services/profile/detail-profile-info.service";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { FeedUIInfoService } from "@api/feed/facades/ui/feed-ui-info.service";
import { FeedCategoryCounts } from "@domain/feed/feed-item.model";

/** Компонент фильтрации ленты по типам контента с мгновенной синхронизацией через URL. */
@Component({
  selector: "app-feed-filter",
  imports: [FiltersDirective, ButtonDirective, CommonModule, IconComponent],
  templateUrl: "./feed-filter.component.html",
  styleUrl: "./feed-filter.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FeedFilterInfoService, ProfileDetailUIInfoService, DetailProfileInfoService],
})
export class FeedFilterComponent implements OnInit {
  private readonly feedFilterInfoService = inject(FeedFilterInfoService);
  private readonly feedUIInfoService = inject(FeedUIInfoService);

  // Массив активных фильтров
  protected readonly includedFilters = this.feedFilterInfoService.includedFilters;

  protected readonly feedFilterOptions = feedFilter;
  protected readonly categoryCounts = this.feedUIInfoService.categoryCounts;

  protected categoryCount(value: string): number {
    return this.categoryCounts()[(value || "all") as keyof FeedCategoryCounts] ?? 0;
  }

  ngOnInit() {
    this.feedFilterInfoService.initializationFeedFilter();
  }

  setFilter(keyword: string): void {
    this.feedFilterInfoService.setFilter(keyword);
  }
}
