/** @format */

import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { SelectComponent } from "@ui/primitives";
import { ReactiveFormsModule } from "@angular/forms";
import { tagsFilter } from "@core/consts/filters/tags-filter.const";
import { ProjectsFilterInfoService } from "./service/projects-filter-info.service";

/** Компонент фильтрации проектов с синхронизацией фильтров через URL query-параметры. */
@Component({
    selector: "app-projects-filter",
    templateUrl: "./projects-filter.component.html",
    styleUrl: "./projects-filter.component.scss",
    imports: [SelectComponent, ReactiveFormsModule],
    providers: [ProjectsFilterInfoService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsFilterComponent implements OnInit, OnDestroy {
  private readonly projectsFilterInfoService = inject(ProjectsFilterInfoService);

  // Константы для фильтрации по типу проекта
  readonly tagsFilter = tagsFilter;

  protected readonly industryControl = this.projectsFilterInfoService.industryControl;

  // Состояние фильтра по отрасли
  protected readonly currentIndustry = this.projectsFilterInfoService.currentIndustry;
  protected readonly industries = this.projectsFilterInfoService.industries;

  // Состояние остальных фильтров
  // protected readonly hasVacancies = this.projectsFilterInfoService.hasVacancies;
  // protected readonly isMospolytech = this.projectsFilterInfoService.isMospolytech;

  // Опции для фильтра по количеству участников
  // membersCountOptions = [1, 2, 3, 4, 5, 6];
  // protected readonly currentMembersCount = this.projectsFilterInfoService.currentMembersCount;

  // Текущий тип проекта (по умолчанию - все проекты)
  // protected readonly currentFilterTag = this.projectsFilterInfoService.currentFilterTag;

  ngOnInit(): void {
    // Подписка на данные об отраслях
    this.projectsFilterInfoService.initializationProjectsFilter();
  }

  ngOnDestroy(): void {
    this.projectsFilterInfoService.destroy();
  }

  onFilterByIndustry(industryId?: number | null): void {
    this.projectsFilterInfoService.onFilterByIndustry(industryId);
  }

  onFilterByMembersCount(count?: number): void {
    this.projectsFilterInfoService.onFilterByMembersCount(count);
  }

  onFilterVacancies(has: boolean): void {
    this.projectsFilterInfoService.onFilterVacancies(has);
  }

  onFilterMospolytech(isMospolytech: boolean): void {
    this.projectsFilterInfoService.onFilterMospolytech(isMospolytech);
  }

  onFilterProjectType(event: Event, tagId?: number | null): void {
    this.projectsFilterInfoService.onFilterProjectType(event, tagId);
  }

  clearFilters(): void {
    this.projectsFilterInfoService.clearFilters();
  }
}
