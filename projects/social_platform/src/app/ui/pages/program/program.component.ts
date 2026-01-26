/** @format */

import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { SearchComponent } from "@ui/components/search/search.component";
import { BackComponent } from "@uilib";
import { ProgramInfoService } from "../../../api/program/facades/program-info.service";
import { ProgramMainUIInfoService } from "../../../api/program/facades/ui/program-main-ui-info.service";

/**
 * Основной компонент модуля "Программы"
 *
 * Функциональность:
 * - Отображает заголовок навигации "Программы"
 * - Предоставляет форму поиска программ
 * - Управляет состоянием активных вкладок (My/All)
 * - Обрабатывает изменения поисковых параметров в URL
 * - Содержит router-outlet для дочерних компонентов
 *
 * Принимает:
 * - NavService - для установки заголовка навигации
 * - ActivatedRoute - для работы с параметрами маршрута
 * - ProgramService - сервис для работы с программами
 * - Router - для навигации и изменения URL параметров
 * - FormBuilder - для создания реактивных форм
 *
 * Возвращает:
 * - HTML шаблон с формой поиска и router-outlet
 * - Управляет состоянием флагов isMy и isAll
 */
@Component({
  selector: "app-program",
  templateUrl: "./program.component.html",
  styleUrl: "./program.component.scss",
  imports: [ReactiveFormsModule, SearchComponent, RouterOutlet, BackComponent],
  providers: [ProgramInfoService, ProgramMainUIInfoService],
  standalone: true,
})
export class ProgramComponent implements OnInit, OnDestroy {
  private readonly programInfoService = inject(ProgramInfoService);
  private readonly programMainUIInfoService = inject(ProgramMainUIInfoService);

  protected readonly searchForm = this.programMainUIInfoService.searchForm;

  ngOnInit(): void {
    this.programInfoService.initializationPrograms();
  }

  ngOnDestroy(): void {
    this.programInfoService.destroy();
  }
}
