/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { optionsListElement } from "@utils/generate-options-list";
import { toObservable } from "@angular/core/rxjs-interop";
import { map, Subject, takeUntil } from "rxjs";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { IndustryRepositoryPort } from "@domain/industry/ports/industry.repository.port";

@Injectable()
export class ProjectsFilterInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly industryRepository = inject(IndustryRepositoryPort);
  private readonly logger = inject(LoggerService);

  private readonly destroy$ = new Subject<void>();

  // Подписки для управления жизненным циклом
  readonly industryControl = new FormControl(null);

  // Состояние фильтра по отрасли
  readonly currentIndustry = signal<number | null>(null);
  readonly industries = signal<optionsListElement[]>([]);

  // Состояние остальных фильтров
  readonly hasVacancies = signal<boolean>(false);
  readonly isMospolytech = signal<boolean>(false);

  // Опции для фильтра по количеству участников
  readonly currentMembersCount = signal<number | null>(null);

  // Текущий тип проекта (по умолчанию - все проекты)
  readonly currentFilterTag = signal<number>(2);

  // Создаём observable в контексте инжекции (field initializer), чтобы toObservable не падал NG0203 при вызове из ngOnInit
  private readonly industries$ = toObservable(this.industryRepository.industries);

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializationProjectsFilter(): void {
    this.initializationIndustries();

    this.initializationIndustryControl();

    // Восстановление состояния фильтров из query параметров
    this.initializationCurrentParams();
  }

  private initializationIndustries(): void {
    this.industries$
      .pipe(
        map(industries =>
          industries.map(industry => ({
            id: industry.id,
            label: industry.name,
            value: industry.name,
          }))
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(industries => {
        this.industries.set(industries);
      });
  }

  private initializationIndustryControl(): void {
    this.industryControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      const industryId = this.industries().find(industry => industry.value === value);
      this.onFilterByIndustry(industryId?.id);
    });
  }

  private initializationCurrentParams(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(queries => {
      this.currentIndustry.set(parseInt(queries["industry"]));
      this.currentMembersCount.set(parseInt(queries["membersCount"]));
      this.hasVacancies.set(queries["anyVacancies"] === "true");
      this.isMospolytech.set(queries["is_mospolytech"] === "true");

      const tagParam = queries["is_rated_by_expert"];
      if (tagParam === undefined || isNaN(Number.parseInt(tagParam))) {
        this.currentFilterTag.set(2);
      } else {
        this.currentFilterTag.set(Number.parseInt(tagParam));
      }
    });
  }

  onFilterByIndustry(industryId?: number | null): void {
    this.router
      .navigate([], {
        queryParams: { industry: industryId === this.currentIndustry() ? undefined : industryId },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => this.logger.debug("Query change from ProjectsComponent"));
  }

  onFilterByMembersCount(count?: number): void {
    this.router
      .navigate([], {
        queryParams: {
          membersCount: count === this.currentMembersCount() ? undefined : count,
        },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => this.logger.debug("Query change from ProjectsComponent"));
  }

  onFilterVacancies(has: boolean): void {
    this.router
      .navigate([], {
        queryParams: {
          anyVacancies: has,
        },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => this.logger.debug("Query change from ProjectsComponent"));
  }

  onFilterMospolytech(isMospolytech: boolean): void {
    this.router
      .navigate([], {
        queryParams: {
          is_mospolytech: isMospolytech,
          partner_program: 3, // TODO: заменить когда появится итоговое id программы для политеха
        },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => this.logger.debug("Query change from ProjectsComponent"));
  }

  onFilterProjectType(event: Event, tagId?: number | null): void {
    event.stopPropagation();

    this.router.navigate([], {
      queryParams: { is_rated_by_expert: tagId === this.currentFilterTag() ? undefined : tagId },
      relativeTo: this.route,
      queryParamsHandling: "merge",
    });
  }

  clearFilters(): void {
    this.currentFilterTag.set(2);

    this.router
      .navigate([], {
        queryParams: {
          step: undefined,
          anyVacancies: undefined,
          membersCount: undefined,
          industry: undefined,
          is_rated_by_expert: undefined,
          is_mospolytech: undefined,
          partner_program: undefined,
          name__contains: undefined,
        },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => this.logger.info("Query change from ProjectsComponent"));
  }
}
