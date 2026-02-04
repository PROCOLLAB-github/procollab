/** @format */

import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, inject, OnDestroy, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ProjectsDetailUIInfoService } from "projects/social_platform/src/app/api/project/facades/detail/ui/projects-detail-ui.service";
import { ProjectsDetailService } from "projects/social_platform/src/app/api/project/facades/detail/projects-detail.service";
import { ProjectsLeftSideComponent } from "./components/projects-left-side/projects-left-side.component";
import { ProjectsRightSideComponent } from "./components/projects-right-side/projects-right-side.component";
import { ProjectsMidSideComponent } from "./components/projects-mid-side/projects-mid-side.component";

/**
 * КОМПОНЕНТ ДЕТАЛЬНОЙ ИНФОРМАЦИИ О ПРОЕКТЕ
 *
 * Этот компонент отображает подробную информацию о проекте, включая:
 * - Основную информацию (название, описание, обложка)
 * - Команду проекта с возможностью управления
 * - Новости проекта с возможностью добавления/редактирования
 * - Вакансии, достижения и контакты
 * - Функции подписки и поддержки проекта
 *
 * @param:
 * - Получает данные проекта через резолвер из маршрута
 * - Использует параметр projectId из URL
 *
 * - Отображение информации о проекте
 * - Управление подпиской на проект
 * - Добавление/редактирование/удаление новостей
 * - Управление командой проекта (для лидера)
 * - Выход из проекта
 * - Передача лидерства другому участнику
 *
 * @returns:
 * - Отображает HTML-шаблон с информацией о проекте
 * - Обрабатывает пользовательские действия через методы компонента
 */
@Component({
  selector: "app-detail",
  templateUrl: "./info.component.html",
  styleUrl: "./info.component.scss",
  standalone: true,
  imports: [
    RouterOutlet,
    RouterOutlet,
    CommonModule,
    ProjectsLeftSideComponent,
    ProjectsRightSideComponent,
    ProjectsMidSideComponent,
  ],
})
export class ProjectInfoComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly projectsDetailService = inject(ProjectsDetailService);
  private readonly projectsDetailUIInfoService = inject(ProjectsDetailUIInfoService);

  // Данные о проекте
  protected readonly project = this.projectsDetailUIInfoService.project;

  /**
   * Инициализация компонента
   * Устанавливает заголовок навигации, загружает новости, определяет статус подписки
   */
  ngOnInit(): void {
    this.projectsDetailService.initializationProjectInfo();
  }

  /**
   * Хук после инициализации представления
   * Перемещает новости в контентную область на десктопе, проверяет необходимость кнопки "Читать полностью"
   */
  ngAfterViewInit(): void {
    this.projectsDetailService.initCheckDescription();
  }

  /**
   * Очистка подписок при уничтожении компонента
   */
  ngOnDestroy(): void {
    this.projectsDetailService.destroy();
  }
}
