/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
  inject,
  ChangeDetectionStrategy,
} from "@angular/core";
import { ButtonComponent, IconComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { CommonModule } from "@angular/common";
import { ControlErrorPipe, ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { expandElement } from "@utils/expand-element";
import {
  debounceTime,
  filter,
  finalize,
  fromEvent,
  map,
  Observable,
  Subscription,
  tap,
} from "rxjs";
import { BreakpointObserver } from "@angular/cdk/layout";
import { ProjectRatingComponent } from "@ui/components/project-rating/project-rating.component";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { TagComponent } from "@ui/components/tag/tag.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { TruncatePipe } from "@core/lib/pipes/formatters/truncate.pipe";
import { HttpResponse } from "@angular/common/http";
import { ProjectRate } from "../../../domain/project/project-rate";
import { ProgramDetailMainUIInfoService } from "../../../api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { RateProjectUseCase } from "../../../api/program/use-cases/rate-project.use-case";
import { AuthInfoService } from "@api/auth/facades/auth-info.service";
import { IndustryInfoService } from "@api/industry/facades/industry-info.service";

/**
 * Компонент карточки оценки проекта
 *
 * Отображает детальную информацию о проекте и форму для его оценки экспертами.
 * Поддерживает навигацию между проектами и различные типы критериев оценки.
 *
 * Принимает:
 * @Input project: ProjectRate | null - Текущий проект для оценки
 *
 * Функциональность:
 * - Отображение информации о проекте (название, описание, изображения)
 * - Форма оценки с различными типами критериев
 * - Возможность развернуть/свернуть описание проекта
 * - Отправка оценки и обработка результата
 * - Поддержка переоценки для пользователей, которые уже оценили
 * - Блокировка оценки при достижении лимита (только для тех, кто не оценивал)
 * - Адаптивный дизайн для мобильных устройств
 *
 * Состояния:
 * @property {FormControl} form - Реактивная форма для оценки
 * @property {Signal<boolean>} submitLoading - Состояние загрузки при отправке
 * @property {Signal<boolean>} readFullDescription - Развернуто ли описание
 * @property {Signal<boolean>} descriptionExpandable - Можно ли развернуть описание
 * @property {Signal<boolean>} projectRated - Оценен ли проект (временно)
 * @property {Signal<boolean>} projectConfirmed - Подтверждена ли оценка окончательно
 * @property {Signal<boolean>} locallyRatedByCurrentUser - Оценил ли пользователь локально
 * @property {Signal<number>} ratedCount - Количество оценок проекта
 */
@Component({
  selector: "app-rating-card",
  templateUrl: "./rating-card.component.html",
  styleUrl: "./rating-card.component.scss",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AvatarComponent,
    IconComponent,
    ButtonComponent,
    ParseLinksPipe,
    ParseBreaksPipe,
    ProjectRatingComponent,
    ControlErrorPipe,
    RouterLink,
    TagComponent,
    ModalComponent,
    TruncatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingCardComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly logger = inject(LoggerService);

  constructor(
    public industryRepository: IndustryInfoService,
    private readonly rateProjectUseCase: RateProjectUseCase,
    private readonly authRepository: AuthInfoService,
    private readonly programDetailMainUIInfoService: ProgramDetailMainUIInfoService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly cdRef: ChangeDetectorRef
  ) {}

  @Input({ required: true }) set project(proj: ProjectRate | null) {
    if (!proj) return;
    this._project.set(proj);
  }

  get project(): ProjectRate | null {
    return this._project();
  }

  @ViewChild("descEl") descEl?: ElementRef;

  _project = signal<ProjectRate | null>(null);
  _currentIndex = signal<number>(0);
  _projects = signal<ProjectRate[]>([]);

  profile = signal<any | null>(null);

  form = new FormControl();

  submitLoading = signal(false);
  confirmLoading = signal(false);

  readFullDescription = signal(false);

  descriptionExpandable = signal(false);

  projectRated = signal(false);

  projectConfirmed = signal(false);

  showConfirmRateModal = signal(false);

  locallyRatedByCurrentUser = signal(false);

  isProjectCriterias = signal(0);
  ratedCount = signal(0);

  readonly programDateFinished = this.programDetailMainUIInfoService.registerDateExpired;
  readonly program = this.programDetailMainUIInfoService.program;

  desktopMode$: Observable<boolean> = this.breakpointObserver
    .observe("(min-width: 920px)")
    .pipe(map(result => result.matches));

  subscriptions$ = signal<Subscription[]>([]);

  ngOnInit(): void {
    if (this.project) {
      const isScored = this.project?.scored || false;
      this.projectConfirmed.set(isScored);
      this.projectRated.set(isScored);
      this.ratedCount.set(this.project.ratedCount);
    }

    const profileId$ = this.authRepository.profile.subscribe({
      next: profile => {
        this.profile.set(profile);
      },
    });

    this.subscriptions$().push(profileId$);
  }

  ngAfterViewInit(): void {
    if (this.project) {
      this.isProjectCriterias.set(
        this.project?.criterias.filter(criteria => !(criteria.type === "str")).length
      );
    }

    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable.set(descElement?.clientHeight < descElement?.scrollHeight);
    this.cdRef.detectChanges();

    const resizeSub$ = fromEvent(window, "resize")
      .pipe(debounceTime(50))
      .subscribe(() => {
        this.descriptionExpandable.set(descElement?.clientHeight < descElement?.scrollHeight);
      });

    this.subscriptions$().push(resizeSub$);
  }

  ngOnDestroy(): void {
    this.subscriptions$().forEach($ => $.unsubscribe());
  }

  expandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription.set(!isExpanded);
  }

  /**
   * Подтверждение оценки проекта
   */
  confirmRateProject(): void {
    this.form.markAsTouched();
    if (this.form.invalid) return;

    const fv = this.form.getRawValue();
    const project = this.project as ProjectRate;

    this.submitLoading.set(true);

    this.rateProjectUseCase
      .execute(project.id, project.criterias, fv)
      .pipe(finalize(() => this.submitLoading.set(false)))
      .subscribe({
        next: result => {
          if (!result.ok) {
            if (result.error.cause instanceof HttpResponse) {
              if (result.error.cause.status === 400) {
                this.logger.error("Ошибка: достигнут максимальный лимит оценок");
              }
            }
            return;
          }

          const profile = this.profile();
          const project = this.project as ProjectRate;

          this.locallyRatedByCurrentUser.set(true);
          this.projectRated.set(true);
          this.projectConfirmed.set(true);

          let isFirstTimeRating = false;

          if (profile) {
            if (!Array.isArray(project.ratedExperts)) {
              project.ratedExperts = [];
            }

            // Проверяем, первый ли раз пользователь оценивает
            if (!project.ratedExperts.includes(profile.id)) {
              project.ratedExperts = [...project.ratedExperts, profile.id];
              isFirstTimeRating = true;
            }
          }

          // Увеличиваем счетчик только при первой оценке
          if (isFirstTimeRating) {
            this.ratedCount.update(count => count + 1);
          }

          this._project.set({ ...project });
          this.showConfirmRateModal.set(false);
        },
      });
  }

  /**
   * Переоценка проекта
   * Сбрасываем статусы, но НЕ удаляем пользователя из списка оценивших
   * После этого пользователь может заново оценить проект
   */
  redoRating(): void {
    this.projectRated.set(false);
    this.projectConfirmed.set(false);
    // locallyRatedByCurrentUser остается true, так как пользователь уже в списке оценивших
    // После сброса статусов кнопка станет "оценить проект" и откроет модалку
  }

  openPresentation(url: string) {
    if (url) {
      window.open(url, "_blank");
    }
  }

  get canEdit(): boolean {
    return !this.programDateFinished();
  }

  get isCurrentUserExpert(): boolean {
    const currentProfile = this.profile();
    const project = this.project;

    if (!currentProfile || !project) return false;

    const isExpertFromBackend =
      !!project.scoredExpertId && project.scoredExpertId === currentProfile.id;

    const isExpertLocally = this.locallyRatedByCurrentUser();

    return isExpertFromBackend || isExpertLocally;
  }

  /**
   * Проверяет, может ли пользователь оценить проект
   * Условия:
   * 1. Программа не завершена
   * 2. Либо лимит не достигнут, либо пользователь уже оценивал (может переоценить)
   */
  get canRate(): boolean {
    if (this.programDateFinished()) return false;

    // Если лимит достигнут, но пользователь уже оценивал - разрешаем переоценку
    if (this.isLimitReached && !this.userRatedThisProject) return false;

    return true;
  }

  /**
   * Текст кнопки в зависимости от состояния
   */
  get rateButtonText(): string {
    if (this.programDateFinished()) return "программа завершена";
    if (this.projectConfirmed() && this.userRatedThisProject) return "проект оценен";
    if (this.isLimitReached && !this.userRatedThisProject) return "лимит оценок достигнут";

    return "оценить проект";
  }

  /**
   * Показывать ли форму оценки
   */
  get showRatingForm(): boolean {
    return !this.projectRated() && this.canEdit;
  }

  /**
   * Показывать ли статус "оценено"
   */
  get showRatedStatus(): boolean {
    return this.projectRated() || this.projectConfirmed();
  }

  /**
   * Показывать ли кнопку редактирования
   * Только если пользователь оценил проект, программа не завершена
   */
  get showEditButton(): boolean {
    return this.projectConfirmed() && !this.programDateFinished() && this.userRatedThisProject;
  }

  /**
   * Проверяет, можно ли открыть модальное окно оценки
   * Модальное окно открывается только для:
   * 1. Первой оценки (когда пользователь не оценивал и лимит не превышен)
   * 2. Переоценки (когда пользователь нажал кнопку редактирования)
   *
   * НЕ открывается когда проект уже оценен и пользователь просто кликает на зеленую кнопку
   */
  get canOpenModal(): boolean {
    // Если проект подтвержден и оценен - НЕ открываем модалку по клику на кнопку
    if (this.projectConfirmed() && this.userRatedThisProject) return false;

    // В остальных случаях проверяем canRate
    return this.canRate;
  }

  /**
   * Проверяет, оценил ли текущий пользователь этот проект
   */
  get userRatedThisProject(): boolean {
    const profile = this.profile();
    const project = this.project;

    if (!profile || !project) return false;

    return (
      this.locallyRatedByCurrentUser() ||
      (Array.isArray(project.ratedExperts) && project.ratedExperts.includes(profile.id))
    );
  }

  /**
   * Должна ли кнопка быть неактивной
   */
  get isButtonDisabled(): boolean {
    // Если лимит достигнут и пользователь не оценивал - блокируем
    if (this.isLimitReached && !this.userRatedThisProject) return true;

    // Если программа завершена - блокируем
    if (this.programDateFinished()) return true;

    // В остальных случаях проверяем canRate
    return !this.canRate;
  }

  /**
   * Цвет кнопки
   */
  get buttonColor(): "green" | "primary" {
    if (this.userRatedThisProject) return "green";
    return "primary";
  }

  /**
   * Прозрачность кнопки
   */
  get buttonOpacity(): string {
    return this.isButtonDisabled ? "0.5" : "1";
  }

  /**
   * Проверяет, достигнут ли лимит оценок
   */
  get isLimitReached(): boolean {
    return !!this.project && this.project.ratedCount >= this.project.maxRates;
  }

  /**
   * Показывать ли состояние "подтверждено"
   */
  get showConfirmedState(): boolean {
    return (
      (this.projectConfirmed() && !this.canEdit) ||
      (this.isLimitReached && !this.userRatedThisProject)
    );
  }

  /**
   * Обработка клика по кнопке оценки
   */
  handleRateButtonClick(): void {
    // Открываем модальное окно только если можно оценить
    if (this.canOpenModal) {
      this.showConfirmRateModal.set(true);
    }
  }

  /**
   * Дополнительная проверка для визуального состояния кнопки
   */
  get buttonTooltip(): string {
    if (this.programDateFinished()) return "Программа завершена";
    if (this.isLimitReached && !this.userRatedThisProject) {
      return "Достигнут максимальный лимит оценок";
    }
    if (this.userRatedThisProject) return "Нажмите для переоценки";
    return "Нажмите для оценки проекта";
  }

  /**
   * Должна ли форма в модалке быть отключена
   * Форма отключена для просмотра, пользователь подтверждает без изменений
   */
  get isModalFormDisabled(): boolean {
    return true; // Всегда disabled в модалке для подтверждения
  }
}
