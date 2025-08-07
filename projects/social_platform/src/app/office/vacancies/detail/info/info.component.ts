/** @format */

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { AuthService } from "@auth/services";
import {
  ParseBreaksPipe,
  ParseLinksPipe,
  SubscriptionPlan,
  SubscriptionPlansService,
} from "@corelib";
import { Project } from "@office/models/project.model";
import { Vacancy } from "@office/models/vacancy.model";
import { ProjectService } from "@office/services/project.service";
import { ButtonComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { TagComponent } from "@ui/components/tag/tag.component";
import { IconComponent } from "@uilib";
import { expandElement } from "@utils/expand-element";
import { SalaryTransformPipe } from "projects/core/src/lib/pipes/salary-transform.pipe";
import { map, Subscription } from "rxjs";
import { CapitalizePipe } from "projects/core/src/lib/pipes/capitalize.pipe";

/**
 * Компонент отображения детальной информации о вакансии
 *
 * Основная функциональность:
 * - Отображение полной информации о вакансии (описание, навыки, условия)
 * - Показ информации о проекте, к которому относится вакансия
 * - Кнопки действий: "Откликнуться" и "Прокачать себя"
 * - Модальное окно с предложением подписки на обучение
 * - Адаптивное отображение с возможностью сворачивания/разворачивания контента
 *
 * Управление контентом:
 * - Автоматическое определение необходимости кнопки "Читать полностью"
 * - Сворачивание длинного описания и списка навыков
 * - Парсинг ссылок и переносов строк в описании
 *
 * Интеграция с сервисами:
 * - VacancyService - получение данных вакансии через резолвер
 * - ProjectService - загрузка информации о проекте
 * - SubscriptionPlansService - получение планов подписки
 * - AuthService - информация о текущем пользователе
 *
 * Жизненный цикл:
 * - OnInit: загрузка данных вакансии и проекта, подписка на планы
 * - AfterViewInit: определение необходимости кнопок "Читать полностью"
 * - OnDestroy: отписка от всех активных подписок
 *
 * @property {Vacancy} vacancy - объект вакансии с полной информацией
 * @property {Project} project - объект проекта, к которому относится вакансия
 * @property {boolean} readFullDescription - состояние развернутого описания
 * @property {boolean} readFullSkills - состояние развернутого списка навыков
 *
 * @selector app-detail
 * @standalone true - автономный компонент
 */
@Component({
  selector: "app-detail",
  standalone: true,
  imports: [
    IconComponent,
    TagComponent,
    ButtonComponent,
    ModalComponent,
    RouterModule,
    ParseBreaksPipe,
    ParseLinksPipe,
    SalaryTransformPipe,
    CapitalizePipe,
  ],
  templateUrl: "./info.component.html",
  styleUrl: "./info.component.scss",
})
export class VacancyInfoComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  projectService = inject(ProjectService);
  authService = inject(AuthService);
  subscriptionPlansService = inject(SubscriptionPlansService);
  cdRef = inject(ChangeDetectorRef);

  vacancy!: Vacancy;
  project!: Project;

  ngOnInit(): void {
    this.route.data.pipe(map(r => r["data"])).subscribe((vacancy: Vacancy) => {
      this.vacancy = vacancy;

      this.projectService.getOne(vacancy.project.id).subscribe((project: Project) => {
        this.project = project;
      });
    });

    const subscriptionsSub$ = this.subscriptionPlansService
      .getSubscriptions()
      .pipe(
        map(subscription => {
          if (Array.isArray(subscription)) {
            return subscription;
          } else return [subscription];
        })
      )
      .subscribe(subscriptions => {
        this.subscriptions.set(subscriptions);
      });
    this.subscriptions$.push(subscriptionsSub$);
  }

  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    const skillsElement = this.skillsEl?.nativeElement;
    this.skillsExpandable = skillsElement?.clientHeight < skillsElement?.scrollHeight;

    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  @ViewChild("skillsEl") skillsEl?: ElementRef;
  @ViewChild("descEl") descEl?: ElementRef;

  subscriptions$: Subscription[] = [];

  openModal = signal<boolean>(false);

  descriptionExpandable!: boolean;
  skillsExpandable!: boolean;

  readFullDescription = false;
  readFullSkills = false;

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }

  onExpandSkills(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullSkills = !isExpanded;
  }

  openSubscription = signal(false);
  subscriptions = signal<SubscriptionPlan[]>([]);

  openSkills() {
    location.href = "https://skills.procollab.ru";
  }
}
