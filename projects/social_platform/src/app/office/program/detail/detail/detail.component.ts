/** @format */

import { Component, inject, OnDestroy, OnInit, signal } from "@angular/core";
import { NavService } from "@services/nav.service";
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from "@angular/router";
import { BarComponent, ButtonComponent, InputComponent } from "@ui/components";
import { BackComponent } from "@uilib";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { CommonModule, Location } from "@angular/common";
import { ProjectAssign } from "@office/projects/models/project-assign.model";
import { ProjectAdditionalService } from "@office/projects/edit/services/project-additional.service";
import { Project } from "@office/models/project.model";
import { ProjectService } from "@office/services/project.service";
import { HttpErrorResponse } from "@angular/common/http";
import { map, Subscription, tap } from "rxjs";
import { Program } from "@office/program/models/program.model";
import { AutosizeModule } from "ngx-autosize";
import { TooltipComponent } from "@ui/components/tooltip/tooltip.component";

/**
 * Основной компонент детальной страницы программы
 *
 * Служит контейнером для всех дочерних страниц программы:
 * - Основная информация
 * - Список проектов
 * - Список участников
 *
 * Предоставляет:
 * - Навигационные вкладки между разделами
 * - Кнопку "Назад" для возврата к списку программ
 * - Общий layout для всех дочерних компонентов
 *
 * Принимает:
 * @param {NavService} navService - Для установки заголовка навигации
 * @param {ActivatedRoute} route - Для получения параметров маршрута
 *
 * Состояние:
 * @property {number} programId - ID текущей программы из URL
 *
 * Жизненный цикл:
 * - OnInit: Устанавливает заголовок "Профиль программы" и сохраняет programId
 *
 * Навигация:
 * - RouterLinkActive для подсветки активной вкладки
 * - RouterLink для навигации между разделами
 * - RouterOutlet для отображения дочерних компонентов
 *
 * Возвращает:
 * HTML шаблон с навигацией и областью для дочерних компонентов
 */
@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrl: "./detail.component.scss",
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    BackComponent,
    RouterModule,
    ButtonComponent,
    InputComponent,
    AvatarComponent,
    ModalComponent,
    AutosizeModule,
    TooltipComponent,
  ],
})
export class ProgramDetailComponent implements OnInit, OnDestroy {
  private readonly projectAdditionalService = inject(ProjectAdditionalService);
  private readonly projectService = inject(ProjectService);
  private readonly navService = inject(NavService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  programId?: number;

  selectedProjectId = 0;
  dubplicatedProjectId = 0;

  memberProjects: Project[] = [];
  program?: Program;
  registerDateExpired!: boolean;

  subscriptions$ = signal<Subscription[]>([]);

  // Сигналы для работы с модальными окнами с текстом
  assignProjectToProgramModalMessage = signal<ProjectAssign | null>(null);

  // Сигналы для управления состоянием
  showSubmitProjectModal = signal(false);
  isAssignProjectToProgramModalOpen = signal(false);
  showDetails = false;

  isTooltipVisible = false;

  isProjectsPage = false;
  isMembersPage = false;
  isProjectsRatingPage = false;

  // Методы для управления состоянием ошибок через сервис
  setAssignProjectToProgramError(error: { non_field_errors: string[] }): void {
    this.projectAdditionalService.setAssignProjectToProgramError(error);
  }

  ngOnInit(): void {
    this.navService.setNavTitle("Профиль программы");

    this.updatePageStates();

    this.location.onUrlChange(url => {
      this.updatePageStates(url);
    });

    const program$ = this.route.data
      .pipe(
        map(r => r["data"]),
        tap(program => {
          this.program = program;
          this.registerDateExpired = Date.now() > Date.parse(program.datetimeRegistrationEnds);
        })
      )
      .subscribe();

    const memeberProjects$ = this.projectService.getMy().subscribe({
      next: projects => {
        this.memberProjects = projects.results.filter(project => !project.draft);
      },
    });

    this.subscriptions$().push(program$);
    this.subscriptions$().push(memeberProjects$);
  }

  ngOnDestroy(): void {
    this.subscriptions$().forEach($ => $.unsubscribe());
  }

  /**
   * Переключатель для модалки выбора проекта
   */
  toggleSubmitProjectModal(): void {
    this.showSubmitProjectModal.set(!this.showSubmitProjectModal());

    if (!this.showSubmitProjectModal()) {
      this.selectedProjectId = 0;
    }
  }

  /**
   * Обработчик изменения радио-кнопки для выбора проекта
   */
  onProjectRadioChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectedProjectId = +target.value;

    if (this.selectedProjectId) {
      this.memberProjects.find(project => project.id === this.selectedProjectId);
    }
  }

  /**
   * Добавление проекта на программу
   */
  addProjectModal(): void {
    if (!this.selectedProjectId) {
      return;
    }

    const selectedProject = this.memberProjects.find(
      project => project.id === this.selectedProjectId
    );

    this.assignProjectToProgram(selectedProject!);
  }

  /** Эмитим логику для привязки проекта к программе */
  /**
   * Привязка проекта к программе выбранной
   * Перенаправление её на редактирование "нового" проекта
   */
  assignProjectToProgram(project: Project): void {
    if (this.programId) {
      this.projectService.assignProjectToProgram(project.id, this.programId).subscribe({
        next: r => {
          this.dubplicatedProjectId = r.newProjectId;
          this.assignProjectToProgramModalMessage.set(r);
          this.isAssignProjectToProgramModalOpen.set(true);
          this.toggleSubmitProjectModal();
          this.selectedProjectId = 0;
        },

        error: err => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 400) {
              this.setAssignProjectToProgramError(err.error);
            }
          }
        },
      });
    }
  }

  closeAssignProjectToProgramModal(): void {
    this.isAssignProjectToProgramModalOpen.set(false);
    this.router.navigateByUrl(
      `/office/projects/${this.dubplicatedProjectId}/edit?editingStep=main`
    );
  }

  /** Показать подсказку */
  showTooltip(): void {
    this.isTooltipVisible = true;
  }

  /** Скрыть подсказку */
  hideTooltip(): void {
    this.isTooltipVisible = false;
  }

  /**
   * Обновляет состояния страниц на основе URL
   */
  private updatePageStates(url?: string): void {
    const currentUrl = url || this.router.url;

    this.isProjectsPage =
      currentUrl.includes("/projects") && !currentUrl.includes("/projects-rating");
    this.isMembersPage = currentUrl.includes("/members");
    this.isProjectsRatingPage = currentUrl.includes("/projects-rating");
  }
}
