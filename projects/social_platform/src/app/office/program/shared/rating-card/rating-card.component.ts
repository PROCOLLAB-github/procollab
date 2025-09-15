/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  signal,
  ViewChild,
} from "@angular/core";
import { ButtonComponent, IconComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { CommonModule } from "@angular/common";
import { ProjectRate } from "@office/program/models/project-rate";
import { ControlErrorPipe, ParseBreaksPipe, ParseLinksPipe } from "projects/core";
import { expandElement } from "@utils/expand-element";
import { debounceTime, finalize, fromEvent, map, Observable, Subscription } from "rxjs";
import { BreakpointObserver } from "@angular/cdk/layout";
import { IndustryService } from "@office/services/industry.service";
import { ProjectRatingComponent } from "@office/shared/project-rating/project-rating.component";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { ProjectRatingService } from "@office/program/services/project-rating.service";
import { RouterLink } from "@angular/router";
import { TagComponent } from "@ui/components/tag/tag.component";

/**
 * Компонент карточки оценки проекта
 *
 * Отображает детальную информацию о проекте и форму для его оценки экспертами.
 * Поддерживает навигацию между проектами и различные типы критериев оценки.
 *
 * Принимает:
 * @Input project: ProjectRate | null - Текущий проект для оценки
 * @Input projects: ProjectRate[] | null - Список всех проектов
 * @Input currentIndex: number - Индекс текущего проекта в списке
 *
 * Генерирует:
 * @Output onNext: EventEmitter<void> - Событие перехода к следующему проекту
 * @Output onPrev: EventEmitter<void> - Событие перехода к предыдущему проекту
 *
 * Зависимости:
 * @param {IndustryService} industryService - Сервис для работы с отраслями
 * @param {ProjectRatingService} projectRatingService - Сервис оценки проектов
 * @param {BreakpointObserver} breakpointObserver - Для адаптивного дизайна
 * @param {ChangeDetectorRef} cdRef - Для ручного обновления представления
 *
 * Функциональность:
 * - Отображение информации о проекте (название, описание, изображения)
 * - Форма оценки с различными типами критериев
 * - Возможность развернуть/свернуть описание проекта
 * - Навигация между проектами
 * - Отправка оценки и обработка результата
 * - Адаптивный дизайн для мобильных устройств
 *
 * Состояния:
 * @property {FormControl} form - Реактивная форма для оценки
 * @property {Signal<boolean>} submitLoading - Состояние загрузки при отправке
 * @property {Signal<boolean>} readFullDescription - Развернуто ли описание
 * @property {Signal<boolean>} descriptionExpandable - Можно ли развернуть описание
 * @property {Signal<boolean>} projectRated - Оценен ли проект
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
    AvatarComponent,
    ParseLinksPipe,
    ParseBreaksPipe,
    ProjectRatingComponent,
    ControlErrorPipe,
    RouterLink,
    TagComponent,
  ],
})
export class RatingCardComponent implements AfterViewInit, OnDestroy {
  constructor(
    public industryService: IndustryService,
    private projectRatingService: ProjectRatingService,
    private breakpointObserver: BreakpointObserver,
    private cdRef: ChangeDetectorRef
  ) {}

  @Input({ required: true }) set project(proj: ProjectRate | null) {
    if (!proj) return;
    this._project.set(proj);
    this.projectRated.set(proj.isScored);
  }

  get project(): ProjectRate | null {
    return this._project();
  }

  @ViewChild("descEl") descEl?: ElementRef;

  _project = signal<ProjectRate | null>(null);
  _currentIndex = signal<number>(0);
  _projects = signal<ProjectRate[]>([]);

  form = new FormControl();

  submitLoading = signal(false);

  readFullDescription = signal(false);

  descriptionExpandable = signal(false);

  projectRated = signal(false);

  desktopMode$: Observable<boolean> = this.breakpointObserver
    .observe("(min-width: 920px)")
    .pipe(map(result => result.matches));

  subscriptions$ = signal<Subscription[]>([]);

  ngAfterViewInit(): void {
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

  submitRating(): void {
    this.form.markAsTouched();

    if (this.form.invalid) return;

    const fv = this.form.getRawValue();

    const project = this.project as ProjectRate;

    const sumbittedVal = this.projectRatingService.formValuesToDTO(project.criterias, fv);

    this.submitLoading.set(true);

    this.projectRatingService
      .rate(project.id, sumbittedVal)
      .pipe(finalize(() => this.submitLoading.set(false)))
      .subscribe(() => this.projectRated.set(true));
  }

  redoRating(): void {
    this.projectRated.set(false);
  }
}
