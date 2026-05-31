/** @format */

import { animate, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import { IconComponent } from "@ui/primitives";
import { ClickOutsideModule } from "ng-click-outside";
import { feedFilter } from "@core/consts/filters/feed-filter.const";
import { FeedFilterInfoService } from "./service/feed-filter-info.service";
import { DetailProfileInfoService } from "../detail/services/profile/detail-profile-info.service";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";

/** Компонент фильтрации ленты по типам контента с мгновенной синхронизацией через URL. */
@Component({
    selector: "app-feed-filter",
    imports: [CommonModule, ClickOutsideModule, IconComponent],
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
    providers: [FeedFilterInfoService, ProfileDetailUIInfoService, DetailProfileInfoService]
})
export class FeedFilterComponent implements OnInit {
  private readonly feedFilterInfoService = inject(FeedFilterInfoService);

  // Состояние выпадающего меню фильтров
  protected readonly filterOpen = this.feedFilterInfoService.filterOpen;

  // Массив активных фильтров
  protected readonly includedFilters = this.feedFilterInfoService.includedFilters;

  protected readonly feedFilterOptions = feedFilter;

  ngOnInit() {
    this.feedFilterInfoService.initializationFeedFilter();
  }

  setFilter(keyword: string): void {
    this.feedFilterInfoService.setFilter(keyword);
  }

  resetFilter(): void {
    this.feedFilterInfoService.resetFilter();
  }

  onClickOutside(): void {
    this.feedFilterInfoService.onClickOutside();
  }
}
