/** @format */

import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { map, Subscription } from "rxjs";
import { IndustryService } from "projects/social_platform/src/app/api/industry/industry.service";
import { SelectComponent } from "@ui/components";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { tagsFilter } from "projects/core/src/consts/filters/tags-filter.const";
import { optionsListElement } from "@utils/generate-options-list";
import { ProjectsFilterInfoService } from "./service/projects-filter-info.service";

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
  imports: [SelectComponent, ReactiveFormsModule],
  providers: [ProjectsFilterInfoService],
})
export class ProjectsFilterComponent implements OnInit {
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

  /**
   * Обработчик фильтрации по отрасли
   * @param event - событие клика
   * @param industryId - ID отрасли (undefined для сброса)
   */
  onFilterByIndustry(industryId?: number | null): void {
    this.projectsFilterInfoService.onFilterByIndustry(industryId);
  }

  /**
   * Обработчик фильтрации по количеству участников
   * @param count - количество участников (undefined для сброса)
   */
  onFilterByMembersCount(count?: number): void {
    this.projectsFilterInfoService.onFilterByMembersCount(count);
  }

  /**
   * Обработчик фильтрации по наличию вакансий
   * @param has - наличие вакансий
   */
  onFilterVacancies(has: boolean): void {
    this.projectsFilterInfoService.onFilterVacancies(has);
  }

  /**
   * Обработчик фильтрации по принадлежности к МосПолитех
   * @param isMospolytech - принадлежность к программе
   */
  onFilterMospolytech(isMospolytech: boolean): void {
    this.projectsFilterInfoService.onFilterMospolytech(isMospolytech);
  }

  /**
   * Обработчик фильтрации по типу проекта
   * @param event - событие клика
   * @param tagId - ID типа проекта (null для сброса)
   */
  onFilterProjectType(event: Event, tagId?: number | null): void {
    this.projectsFilterInfoService.onFilterProjectType(event, tagId);
  }

  /**
   * Сброс всех активных фильтров
   * Очищает все query параметры и возвращает к состоянию по умолчанию
   */
  clearFilters(): void {
    this.projectsFilterInfoService.clearFilters();
  }
}
