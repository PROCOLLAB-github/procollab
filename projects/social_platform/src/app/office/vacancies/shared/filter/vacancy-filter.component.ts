/** @format */

import { animate, style, transition, trigger } from "@angular/animations";
import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ButtonComponent, CheckboxComponent, IconComponent, InputComponent } from "@ui/components";
import { ClickOutsideModule } from "ng-click-outside";
import { FeedService } from "@office/feed/services/feed.service";

@Component({
  selector: "app-vacancy-filter",
  standalone: true,
  imports: [
    CommonModule,
    CheckboxComponent,
    ButtonComponent,
    ClickOutsideModule,
    IconComponent,
    InputComponent,
  ],
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

  @Input() searchValue: string | null = null;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.currentExperience.set(params["experience"] || null);
      this.currentWorkFormat.set(params["workFormat"] || null);
      this.currentWorkSchedule.set(params["workSchedule"] || null);
      if (params["includes"]) {
        this.includedFilters.set(params["includes"].split(this.feedService.FILTER_SPLIT_SYMBOL));
      }
    });
  }

  filterOpen = signal(false);

  currentExperience = signal<string | null>(null);
  currentWorkFormat = signal<string | null>(null);
  currentWorkSchedule = signal<string | null>(null);

  filterExperienceOptions = [
    { label: "без опыта", value: "recent" },
    { label: "до 1 года", value: "viewed" },
    { label: "от 1 года до 3 лет", value: "clicked" },
    { label: "от 3 лет и более", value: "non_clicked" },
  ];

  filterWorkFormatOptions = [
    { label: "удаленная работа", value: "recent" },
    { label: "работа в офисе", value: "viewed" },
    { label: "смешанный формат", value: "clicked" },
  ];

  filterWorkScheduleOptions = [
    { label: "полный рабочий день", value: "recent" },
    { label: "сменный график", value: "viewed" },
    { label: "гибкий график", value: "clicked" },
    { label: "частичная занятость", value: "non_clicked" },
    { label: "стажировка", value: "non_clicked" },
  ];

  includedFilters = signal<string[]>([]);

  applyFilter(): void {
    this.router
      .navigate([], {
        queryParams: {
          includes: this.includedFilters().join(this.feedService.FILTER_SPLIT_SYMBOL),
          required__experience: this.currentExperience(),
          work__format: this.currentWorkFormat(),
          work__schedule: this.currentWorkSchedule(),
          name__contains: this.searchValue,
        },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Query change from FeedFilterComponent"));
  }

  setExperienceFilter(event: Event, experienceId: string): void {
    event.stopPropagation();
    this.currentExperience.set(experienceId === this.currentExperience() ? null : experienceId);
    this.applyFilter();
  }

  setWorkFormatFilter(event: Event, formatId: string): void {
    event.stopPropagation();
    this.currentWorkFormat.set(formatId === this.currentWorkFormat() ? null : formatId);
    this.applyFilter();
  }

  setWorkScheduleFilter(event: Event, scheduleId: string): void {
    event.stopPropagation();
    this.currentWorkSchedule.set(scheduleId === this.currentWorkSchedule() ? null : scheduleId);
    this.applyFilter();
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
