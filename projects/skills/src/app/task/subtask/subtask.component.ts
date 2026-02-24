/** @format */

import {
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  type OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { InfoTaskComponent } from "../shared/video-task/info-task.component";
import { RadioSelectTaskComponent } from "../shared/radio-select-task/radio-select-task.component";
import { RelationsTaskComponent } from "../shared/relations-task/relations-task.component";
import { ButtonComponent } from "@ui/components";
import { ExcludeTaskComponent } from "../shared/exclude-task/exclude-task.component";
import { ActivatedRoute, NavigationStart, Router, RouterLink } from "@angular/router";
import { concatMap, map, tap } from "rxjs";
import { LoaderComponent } from "@ui/components/loader/loader.component";
import { TaskService } from "../services/task.service";
import type { TaskStep } from "../../../models/skill.model";
import { toSignal } from "@angular/core/rxjs-interop";
import type {
  ConnectQuestion,
  ConnectQuestionResponse,
  ExcludeQuestion,
  ExcludeQuestionResponse,
  InfoSlide,
  SingleQuestion,
  SingleQuestionError,
  StepType,
  WriteQuestion,
} from "../../../models/step.model";
import { WriteTaskComponent } from "../shared/write-task/write-task.component";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { IconComponent } from "@uilib";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { SkillService } from "../../skills/services/skill.service";
import { SnackbarService } from "@ui/services/snackbar.service";

/**
 * Компонент подзадания
 *
 * Обрабатывает выполнение отдельных шагов задания и взаимодействие пользователя.
 * Этот компонент динамически отображает различные типы вопросов и заданий
 * на основе типа шага, управляет ответами пользователя и обрабатывает навигацию
 * между шагами.
 *
 * Поддерживаемые типы шагов:
 * - info_slide: Отображение информации без взаимодействия
 * - question_single_answer: Вопросы с единственным выбором
 * - question_connect: Задания на соединение/сопоставление
 * - exclude_question: Задания на исключение
 * - question_write: Задания с письменным ответом
 *
 * Функции:
 * - Динамическое отображение компонентов на основе типа шага
 * - Проверка ответов в реальном времени и обратная связь
 * - Обработка ошибок с подсказками и исправлениями
 * - Автоматическое продвижение к следующим шагам
 * - Модальные всплывающие окна для дополнительной информации
 * - Состояния загрузки
 */
@Component({
  selector: "app-subtask",
  standalone: true,
  imports: [
    CommonModule,
    InfoTaskComponent,
    RadioSelectTaskComponent,
    RelationsTaskComponent,
    ButtonComponent,
    ExcludeTaskComponent,
    LoaderComponent,
    WriteTaskComponent,
    ModalComponent,
    IconComponent,
    NgOptimizedImage,
    ParseBreaksPipe,
    ParseLinksPipe,
  ],
  templateUrl: "./subtask.component.html",
  styleUrl: "./subtask.component.scss",
})
export class SubtaskComponent implements OnInit {
  // Внедренные сервисы
  router = inject(Router);
  route = inject(ActivatedRoute);
  cdref = inject(ChangeDetectorRef);
  taskService = inject(TaskService);
  skillService = inject(SkillService);
  snackbarService = inject(SnackbarService);

  // Состояние UI
  loading = signal(false);
  hint = signal("");

  isAddInfo = signal<boolean>(false);

  // Получение ID подзадания из параметров маршрута
  subTaskId = toSignal(
    this.route.params.pipe(
      map(r => r["subTaskId"]),
      map(Number)
    )
  );

  // Ссылка на компонент отношений для управления линиями соединения
  @ViewChild(RelationsTaskComponent) relationsTask: RelationsTaskComponent | null = null;

  // Сигналы состояния для различных типов шагов
  infoSlide = signal<InfoSlide | null>(null);
  singleQuestion = signal<SingleQuestion | null>(null);
  connectQuestion = signal<ConnectQuestion | null>(null);
  excludeQuestion = signal<ExcludeQuestion | null>(null);
  writeQuestion = signal<WriteQuestion | null>(null);

  // Сигналы ошибок для различных типов вопросов
  connectQuestionError = signal<ConnectQuestionResponse | null>(null);
  singleQuestionError = signal<SingleQuestionError | null>(null);
  excludeQuestionError = signal<ExcludeQuestionResponse | null>(null);
  loader = signal<boolean>(false);
  success = signal(false);

  // Текущий открытый тип вопроса для модального окна
  openQuestion = signal<
    | "exclude_question"
    | "question_single_answer"
    | "question_connect"
    | "info_slide"
    | "question_write"
    | null
  >(null);

  constructor() {
    // Обработка навигации назад через браузер
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (event.navigationTrigger === "popstate" && event.restoredState) {
          this.router.navigateByUrl(`/skills/${this.skillService.getSkillId()}`);
        }
      }
    });
  }

  ngOnInit() {
    // Загрузка данных шага при изменении параметров маршрута
    this.route.params
      .pipe(
        map(p => p["subTaskId"]),
        tap(() => {
          this.loading.set(true);
        }),
        concatMap(subTaskId => {
          this.openQuestion.set(this.route.snapshot.queryParams["type"]);
          return this.taskService.fetchStep(subTaskId, this.route.snapshot.queryParams["type"]);
        })
      )
      .subscribe({
        next: step => {
          const subTaskId = this.subTaskId();

          const stepMetadata = subTaskId ? this.taskService.getStep(subTaskId) : null;
          if (stepMetadata?.isDone) {
            this.router.navigate(["../results"], { relativeTo: this.route });
            return;
          }

          this.setStepData(step);
          setTimeout(() => this.loading.set(false), 500);
        },
        complete: () => {
          setTimeout(() => this.loading.set(false), 500);
        },
      });
  }

  /**
   * Устанавливает данные шага на основе типа
   * Очищает предыдущие данные и устанавливает новые в соответствующий сигнал
   */
  setStepData(step: StepType) {
    const type = this.route.snapshot.queryParams["type"] as TaskStep["type"];

    this.clearData();

    if (type === "question_single_answer") {
      this.singleQuestion.set(step as SingleQuestion);
    } else if (type === "question_connect") {
      this.connectQuestion.set(step as ConnectQuestion);
    } else if (type === "info_slide") {
      this.infoSlide.set(step as InfoSlide);
    } else if (type === "exclude_question") {
      this.excludeQuestion.set(step as ExcludeQuestion);
    } else if (type === "question_write") {
      this.writeQuestion.set(step as WriteQuestion);
    }
  }

  // Тело запроса для отправки ответов
  body = signal<any>({});

  /**
   * Очищает все данные шагов
   * Сбрасывает все сигналы состояния к null
   */
  clearData() {
    [
      this.singleQuestion,
      this.connectQuestion,
      this.infoSlide,
      this.excludeQuestion,
      this.writeQuestion,
      this.singleQuestionError,
      this.connectQuestionError,
    ].forEach(s => s.set(null));
  }

  /**
   * Обработчик изменения состояния модального окна
   */
  onOpenChange(event: any) {
    if (!event) {
      this.openQuestion.set(null);
    } else {
      this.openQuestion.set(event);
    }
  }

  /**
   * Обработчик закрытия модального окна
   * Переходит к следующему шагу или к результатам
   */
  onCloseModal() {
    const id = this.subTaskId();
    if (!id) return;

    setTimeout(() => {
      this.success.set(false);
      const nextStep = this.taskService.getNextStep(id);
      if (!nextStep) {
        this.router.navigate(["../results"], { relativeTo: this.route }).then(() => {});
        this.taskService.currentTaskDone.set(true);
        return;
      }

      this.router
        .navigate(["../", nextStep.id], {
          relativeTo: this.route,
          queryParams: { type: nextStep.type },
        })
        .then(() => {});
    }, 1000);
  }

  /**
   * Обработчик перехода к следующему шагу
   * Отправляет ответ пользователя и обрабатывает результат
   */
  onNext() {
    this.loader.set(true);

    const id = this.subTaskId();
    if (!id) return;

    const type = this.route.snapshot.queryParams["type"] as TaskStep["type"];

    // Отправка ответа на сервер для проверки
    this.taskService.checkStep(id, type, this.body()).subscribe({
      next: _res => {
        this.success.set(true);
        // Проверка наличия всплывающих окон для отображения

        this.taskService.markStepDone(id);
        this.snackbarService.success("правильный ответ, продолжайте дальше");

        if (
          (type === "info_slide" && !this.infoSlide()?.popups.length) ||
          (type === "exclude_question" && !this.excludeQuestion()?.popups.length) ||
          (type === "question_connect" && !this.connectQuestion()?.popups.length) ||
          (type === "question_single_answer" && !this.singleQuestion()?.popups.length) ||
          (type === "question_write" && !this.writeQuestion()?.popups.length)
        ) {
          // Автоматический переход к следующему шагу, если нет всплывающих окон
          setTimeout(() => {
            this.success.set(false);
            const nextStep = this.taskService.getNextStep(id);

            if (!nextStep) {
              this.router.navigate(["../results"], { relativeTo: this.route }).then(() => {});
              this.taskService.currentTaskDone.set(true);
              return;
            }

            this.loader.set(false);
            this.router
              .navigate(["../", nextStep.id], {
                relativeTo: this.route,
                queryParams: { type: nextStep.type },
              })
              .then(() => {});
          }, 1000);
        }
      },
      error: err => {
        this.loader.set(false);

        // Обработка ошибок и отображение подсказок
        this.snackbarService.error("упс, вышла неточность! попробуйте еще раз");

        if (err.error.hint) {
          this.hint.set(err.error.hint);
          this.cdref.detectChanges();
        }

        // Установка специфичных ошибок для разных типов вопросов
        if (type === "question_connect") {
          this.connectQuestionError.set(err.error);
          this.relationsTask?.removeLines();
        } else if (type === "question_single_answer") {
          this.singleQuestionError.set(err.error);
        } else if (type === "exclude_question") {
          this.excludeQuestionError.set(err.error);
        }
      },
    });
  }
}
