/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from "@angular/core";
import { RangeInputComponent } from "@ui/components/range-input/range-input.component";
import { ReactiveFormsModule } from "@angular/forms";
import { AutoCompleteInputComponent } from "@ui/components/autocomplete-input/autocomplete-input.component";
import { Specialization } from "projects/social_platform/src/app/domain/specializations/specialization";
import { ActivatedRoute, Router } from "@angular/router";
import { CheckboxComponent } from "../checkbox/checkbox.component";
import { MembersComponent } from "@ui/pages/members/members.component";
import { Skill } from "../../../domain/skills/skill";
import { SkillsService } from "../../../api/skills/skills.service";
import { SpecializationsService } from "../../../api/specializations/specializations.service";

/**
 * Компонент фильтров для списка участников
 *
 * Предоставляет интерфейс для фильтрации участников по следующим критериям:
 * - Ключевой навык (с автодополнением)
 * - Специальность (с автодополнением)
 * - Возрастной диапазон (слайдер)
 * - Принадлежность к МосПолитеху (чекбокс)
 *
 * Все изменения фильтров синхронизируются с URL параметрами
 *
 * @component MembersFiltersComponent
 */
@Component({
  selector: "app-members-filters",
  standalone: true,
  imports: [
    CommonModule,
    RangeInputComponent,
    ReactiveFormsModule,
    AutoCompleteInputComponent,
    CheckboxComponent,
  ],
  templateUrl: "./members-filters.component.html",
  styleUrl: "./members-filters.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembersFiltersComponent {
  /**
   * Событие, генерируемое при изменении фильтров
   * (В данный момент не используется, но может быть полезно для будущих расширений)
   */
  @Output() filtersChanged = new EventEmitter();

  /**
   * Форма фильтрации, передаваемая из родительского компонента
   * Содержит поля: keySkill, speciality, age, isMosPolytechStudent
   */
  @Input({ required: true }) filterForm!: MembersComponent["filterForm"];

  /**
   * Сигнал с опциями специальностей для автодополнения
   * Обновляется при поиске специальностей
   */
  specsOptions = signal<Specialization[]>([]);

  /**
   * Сигнал с опциями навыков для автодополнения
   * Обновляется при поиске навыков
   */
  skillsOptions = signal<Skill[]>([]);

  /**
   * Конструктор компонента
   *
   * @param route - Сервис для работы с активным маршрутом
   * @param router - Сервис для навигации и управления URL параметрами
   * @param specsService - Сервис для получения списка специальностей
   * @param skillsService - Сервис для получения списка навыков
   */
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly specsService: SpecializationsService,
    private readonly skillsService: SkillsService
  ) {}

  /**
   * Обработчик выбора специальности из списка автодополнения
   *
   * @param speciality - Выбранная специальность
   */
  onSelectSpec(speciality: Specialization): void {
    this.filterForm.patchValue({ speciality: speciality.name });
  }

  /**
   * Очищает поле специальности
   */
  onClearSpecField(): void {
    this.filterForm.patchValue({ speciality: "" });
  }

  /**
   * Выполняет поиск специальностей по запросу для автодополнения
   *
   * @param query - Поисковый запрос
   */
  onSearchSpec(query: string): void {
    this.specsService.getSpecializationsInline(query, 1000, 0).subscribe(({ results }) => {
      this.specsOptions.set(results);
    });
  }

  /**
   * Обработчик выбора навыка из списка автодополнения
   *
   * @param skill - Выбранный навык
   */
  onSelectSkill(skill: Skill): void {
    this.filterForm.patchValue({ keySkill: skill.name });
  }

  /**
   * Очищает поле навыка
   */
  onClearSkillField(): void {
    this.filterForm.patchValue({ keySkill: "" });
  }

  /**
   * Выполняет поиск навыков по запросу для автодополнения
   *
   * @param query - Поисковый запрос
   */
  onSearchSkill(query: string): void {
    this.skillsService.getSkillsInline(query, 1000, 0).subscribe(({ results }) => {
      this.skillsOptions.set(results);
    });
  }

  /**
   * Переключает состояние чекбокса "Студент МосПолитеха"
   */
  onToggleStudentMosPolitech(): void {
    this.filterForm.patchValue({
      isMosPolytechStudent: !this.filterForm.get("isMosPolytechStudent")?.value,
    });
  }

  /**
   * Очищает все фильтры
   *
   * Удаляет все параметры фильтрации из URL и сбрасывает форму к начальному состоянию
   */
  clearFilters(): void {
    this.router
      .navigate([], {
        queryParams: {
          fullname: undefined,
          is_mospolytech_student: undefined,
          skills__contains: undefined,
          speciality__icontains: undefined,
        },
        relativeTo: this.route,
        queryParamsHandling: "merge",
      })
      .then(() => console.log("Query change from ProjectsComponent"));

    this.filterForm.reset();
  }
}
