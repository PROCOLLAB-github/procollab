/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { optionsListElement } from "@utils/generate-options-list";
import { IndustryService } from "projects/social_platform/src/app/api/industry/industry.service";
import { map, Subject, takeUntil } from "rxjs";

@Injectable()
export class ProjectsFilterInfoService {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly industryService = inject(IndustryService);

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
    this.industryService.industries
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
    this.route.queryParams.subscribe(queries => {
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

  /**
   * Обработчик фильтрации по отрасли
   * @param event - событие клика
   * @param industryId - ID отрасли (undefined для сброса)
   */
  onFilterByIndustry(industryId?: number | null): void {
    this.router
      .navigate([], {
        queryParams: { industry: industryId === this.currentIndustry() ? undefined : industryId },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Query change from ProjectsComponent"));
  }

  /**
   * Обработчик фильтрации по количеству участников
   * @param count - количество участников (undefined для сброса)
   */
  onFilterByMembersCount(count?: number): void {
    this.router
      .navigate([], {
        queryParams: {
          membersCount: count === this.currentMembersCount() ? undefined : count,
        },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Query change from ProjectsComponent"));
  }

  /**
   * Обработчик фильтрации по наличию вакансий
   * @param has - наличие вакансий
   */
  onFilterVacancies(has: boolean): void {
    this.router
      .navigate([], {
        queryParams: {
          anyVacancies: has,
        },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Query change from ProjectsComponent"));
  }

  /**
   * Обработчик фильтрации по принадлежности к МосПолитех
   * @param isMospolytech - принадлежность к программе
   */
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
      .then(() => console.debug("Query change from ProjectsComponent"));
  }

  /**
   * Обработчик фильтрации по типу проекта
   * @param event - событие клика
   * @param tagId - ID типа проекта (null для сброса)
   */
  onFilterProjectType(event: Event, tagId?: number | null): void {
    event.stopPropagation();

    this.router.navigate([], {
      queryParams: { is_rated_by_expert: tagId === this.currentFilterTag() ? undefined : tagId },
      relativeTo: this.route,
      queryParamsHandling: "merge",
    });
  }

  /**
   * Сброс всех активных фильтров
   * Очищает все query параметры и возвращает к состоянию по умолчанию
   */
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
      .then(() => console.log("Query change from ProjectsComponent"));
  }
}
