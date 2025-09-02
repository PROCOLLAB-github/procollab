/** @format */

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { ProjectStep } from "@models/project.model";
import { Industry } from "@models/industry.model";
import { IndustryService } from "@services/industry.service";
import { ProjectService } from "@services/project.service";
import { SwitchComponent } from "@ui/components/switch/switch.component";
import { NumSliderComponent } from "@ui/components/num-slider/num-slider.component";
import { CheckboxComponent } from "@ui/components";
import { filterTags } from "projects/core/src/consts/filter-tags";

/**
 * Компонент фильтрации проектов
 *
 * Функциональность:
 * - Предоставляет интерфейс для фильтрации списка проектов
 * - Управляет фильтрами по различным критериям:
 *   - Этап проекта (идея, разработка, тестирование и т.д.)
 *   - Отрасль/направление проекта
 *   - Количество участников в команде
 *   - Наличие открытых вакансий
 *   - Принадлежность к программе МосПолитех
 *   - Тип проекта (оценен экспертами или нет)
 *
 * Принимает:
 * - Query параметры из URL для восстановления состояния фильтров
 * - Данные об отраслях и этапах проектов из сервисов
 *
 * Возвращает:
 * - Обновляет query параметры URL при изменении фильтров
 * - Эмитит события для закрытия панели фильтров
 *
 * Особенности:
 * - Синхронизирует состояние фильтров с URL
 * - Поддерживает сброс всех фильтров
 * - Адаптивный интерфейс для мобильных устройств
 */
@Component({
  selector: "app-projects-filter",
  templateUrl: "./projects-filter.component.html",
  styleUrl: "./projects-filter.component.scss",
  standalone: true,
  imports: [CheckboxComponent, NumSliderComponent, SwitchComponent],
})
export class ProjectsFilterComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly industryService: IndustryService,
    private readonly projectService: ProjectService
  ) {}

  // Константы для фильтрации по типу проекта
  readonly filterTags = filterTags;

  ngOnInit(): void {
    // Подписка на данные об отраслях
    this.industries$ = this.industryService.industries.subscribe(industries => {
      this.industries = industries;
    });

    // Подписка на данные об этапах проектов
    this.steps$ = this.projectService.steps.subscribe(steps => {
      this.steps = steps;
    });

    // Восстановление состояния фильтров из query параметров
    this.queries$ = this.route.queryParams.subscribe(queries => {
      this.currentIndustry = parseInt(queries["industry"]);
      this.currentStep = parseInt(queries["step"]);
      this.currentMembersCount = parseInt(queries["membersCount"]);
      this.hasVacancies = queries["anyVacancies"] === "true";
      this.isMospolytech = queries["is_mospolytech"] === "true";

      const tagParam = queries["is_rated_by_expert"];
      if (tagParam === undefined || isNaN(Number.parseInt(tagParam))) {
        this.currentFilterTag = 2;
      } else {
        this.currentFilterTag = Number.parseInt(tagParam);
      }
    });
  }

  // Подписки для управления жизненным циклом
  queries$?: Subscription;

  // Состояние фильтра по этапу проекта
  currentStep: number | null = null;
  steps: ProjectStep[] = [];
  steps$?: Subscription;

  // Состояние фильтра по отрасли
  currentIndustry: number | null = null;
  industries: Industry[] = [];
  industries$?: Subscription;

  // Состояние остальных фильтров
  hasVacancies = false;
  isMospolytech = false;

  // Опции для фильтра по количеству участников
  membersCountOptions = [1, 2, 3, 4, 5, 6];
  currentMembersCount: number | null = null;

  // Текущий тип проекта (по умолчанию - все проекты)
  currentFilterTag = 2;

  /**
   * Обработчик фильтрации по этапу проекта
   * @param event - событие клика
   * @param stepId - ID этапа проекта (undefined для сброса)
   */
  onFilterByStep(event: Event, stepId?: number): void {
    event.stopPropagation();

    this.router
      .navigate([], {
        queryParams: { step: stepId === this.currentStep ? undefined : stepId },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.debug("Query change from ProjectsComponent"));
    console.log(stepId, this.currentStep);
  }

  /**
   * Обработчик фильтрации по отрасли
   * @param event - событие клика
   * @param industryId - ID отрасли (undefined для сброса)
   */
  onFilterByIndustry(event: Event, industryId?: number): void {
    event.stopPropagation();

    this.router
      .navigate([], {
        queryParams: { industry: industryId === this.currentIndustry ? undefined : industryId },
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
          membersCount: count === this.currentMembersCount ? undefined : count,
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
      queryParams: { is_rated_by_expert: tagId === this.currentFilterTag ? undefined : tagId },
      relativeTo: this.route,
      queryParamsHandling: "merge",
    });
  }

  /**
   * Сброс всех активных фильтров
   * Очищает все query параметры и возвращает к состоянию по умолчанию
   */
  clearFilters(): void {
    this.currentFilterTag = 2;

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
