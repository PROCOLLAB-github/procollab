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
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { VacancyService } from "@office/services/vacancy.service";
import { map, Subscription, tap } from "rxjs";

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
    ReactiveFormsModule,
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
  vacancyService = inject(VacancyService);

  constructor(private readonly fb: FormBuilder) {
    this.salaryForm = this.fb.group({
      salaryMin: [""],
      salaryMax: [""],
    });
  }

  private _searchValue: string | undefined;

  @Input() set searchValue(value: string | undefined) {
    this._searchValue = value;
  }

  get searchValue(): string | undefined {
    return this._searchValue;
  }

  @Output() searchValueChange = new EventEmitter<string>();

  ngOnInit() {
    this.queries$ = this.route.queryParams.subscribe(queries => {
      this.currentExperience.set(queries["required_experience"]);
      this.currentWorkFormat.set(queries["work_format"]);
      this.currentWorkSchedule.set(queries["work_schedule"]);
      this.currentSalaryMin.set(queries["salary_min"]);
      this.currentSalaryMax.set(queries["salary_max"]);
      this.searchValue = queries["role_contains"];
    });
  }

  queries$?: Subscription;
  filterOpen = signal(false);
  salaryForm: FormGroup;
  totalItemsCount = signal(0);

  currentExperience = signal<string | undefined>(undefined);
  currentWorkFormat = signal<string | undefined>(undefined);
  currentWorkSchedule = signal<string | undefined>(undefined);

  currentSalaryMin = signal<string | undefined>(undefined);
  currentSalaryMax = signal<string | undefined>(undefined);

  filterExperienceOptions = [
    { label: "без опыта", value: "no_experience" },
    { label: "до 1 года", value: "up_to_a_year" },
    { label: "от 1 года до 3 лет", value: "from_one_to_three_years" },
    { label: "от 3 лет и более", value: "from_three_years" },
  ];

  filterWorkFormatOptions = [
    { label: "удаленная работа", value: "remote" },
    { label: "работа в офисе", value: "office" },
    { label: "смешанный формат", value: "hybrid" },
  ];

  filterWorkScheduleOptions = [
    { label: "полный рабочий день", value: "full_time" },
    { label: "сменный график", value: "shift_work" },
    { label: "гибкий график", value: "flexible_schedule" },
    { label: "частичная занятость", value: "part_time" },
    { label: "стажировка", value: "internship" },
  ];

  setExperienceFilter(event: Event, experienceId: string): void {
    event.stopPropagation();
    this.currentExperience.set(
      experienceId === this.currentExperience() ? undefined : experienceId
    );

    this.router
      .navigate([], {
        queryParams: { required_experience: this.currentExperience() },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Query change from ProjectsComponent"));
  }

  setWorkFormatFilter(event: Event, formatId: string): void {
    event.stopPropagation();
    this.currentWorkFormat.set(formatId === this.currentWorkFormat() ? undefined : formatId);

    this.router
      .navigate([], {
        queryParams: { work_format: this.currentWorkFormat() },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Query change from ProjectsComponent"));
  }

  setWorkScheduleFilter(event: Event, scheduleId: string): void {
    event.stopPropagation();
    this.currentWorkSchedule.set(
      scheduleId === this.currentWorkSchedule() ? undefined : scheduleId
    );

    this.router
      .navigate([], {
        queryParams: {
          work_schedule: this.currentWorkSchedule(),
        },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Query change from ProjectsComponent"));
  }

  applyFilter() {
    const salaryMin = this.salaryForm.get("salaryMin")?.value || "";
    const salaryMax = this.salaryForm.get("salaryMax")?.value || "";

    this.router.navigate([], {
      queryParams: {
        role_contains: this.searchValue || null,
        salary_min: salaryMin,
        salary_max: salaryMax,
      },
      queryParamsHandling: "merge",
      relativeTo: this.route,
    });
  }

  resetFilter(): void {
    this.currentExperience.set(undefined);
    this.currentWorkFormat.set(undefined);
    this.currentWorkSchedule.set(undefined);
    this.onSearchValueChanged("");
    this.salaryForm.reset();

    this.router
      .navigate([], {
        queryParams: {
          required_experience: null,
          work_format: null,
          work_schedule: null,
          salary_min: null,
          salary_max: null,
          role_contains: null,
        },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Filters reset from VacancyFilterComponent"));
  }

  onSearchValueChanged(value: string) {
    this.searchValueChange.emit(value);
  }

  onClickOutside(): void {
    this.filterOpen.set(false);
  }

  onFetch(offset: number, limit: number, projectId?: number) {
    return this.vacancyService
      .getForProject(
        limit,
        offset,
        projectId,
        this.currentExperience(),
        this.currentWorkFormat(),
        this.currentWorkSchedule(),
        this.currentSalaryMin(),
        this.currentSalaryMax(),
        this.searchValue
      )
      .pipe(
        tap((res: any) => {
          this.totalItemsCount.set(res.length);
        }),
        map(res => res)
      );
  }
}
