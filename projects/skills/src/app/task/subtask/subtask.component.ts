/** @format */

import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { InfoTaskComponent } from "../shared/video-task/info-task.component";
import { RadioSelectTaskComponent } from "../shared/radio-select-task/radio-select-task.component";
import { RelationsTaskComponent } from "../shared/relations-task/relations-task.component";
import { ButtonComponent } from "@ui/components";
import { ExcludeTaskComponent } from "../shared/exclude-task/exclude-task.component";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { concatMap, map, tap } from "rxjs";
import { LoaderComponent } from "@ui/components/loader/loader.component";
import { TaskService } from "../services/task.service";
import { TaskStep } from "../../../models/skill.model";
import { toSignal } from "@angular/core/rxjs-interop";
import {
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
    RouterLink,
    LoaderComponent,
    WriteTaskComponent,
    ModalComponent,
    IconComponent,
  ],
  templateUrl: "./subtask.component.html",
  styleUrl: "./subtask.component.scss",
})
export class SubtaskComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  taskService = inject(TaskService);

  loading = signal(false);

  subTaskId = toSignal(
    this.route.params.pipe(
      map(r => r["subTaskId"]),
      map(Number)
    )
  );

  // stepData = signal<StepType | null>(null);
  infoSlide = signal<InfoSlide | null>(null);
  singleQuestion = signal<SingleQuestion | null>(null);
  connectQuestion = signal<ConnectQuestion | null>(null);
  excludeQuestion = signal<ExcludeQuestion | null>(null);
  writeQuestion = signal<WriteQuestion | null>(null);

  connectQuestionError = signal<ConnectQuestionResponse | null>(null);
  singleQuestionError = signal<SingleQuestionError | null>(null);
  excludeQuestionError = signal<ExcludeQuestionResponse | null>(null);
  anyError = signal(false);
  success = signal(false);

  openQuestion = signal<
    | "info_slide"
    | "exclude_question"
    | "write_question"
    | "single_question"
    | "connect_question"
    | null
  >("info_slide");

  ngOnInit() {
    this.route.params
      .pipe(
        map(p => p["subTaskId"]),
        tap(() => {
          this.loading.set(true);
        }),
        concatMap(subTaskId => {
          return this.taskService.fetchStep(subTaskId, this.route.snapshot.queryParams["type"]);
        })
      )
      .subscribe({
        next: step => {
          this.setStepData(step);
          setTimeout(() => this.loading.set(false), 500);
        },
        complete: () => {
          setTimeout(() => this.loading.set(false), 500);
        },
      });

    this.openQuestion.set(this.route.snapshot.queryParams["type"]);
  }

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

  body = signal<any>({});

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

  onOpenChange(event: any) {
    if (!event) {
      this.openQuestion.set(null);
    } else {
      this.openQuestion.set(event);
    }
  }

  onCloseModal() {
    this.openQuestion.set(null);

    const id = this.subTaskId();
    if (!id) return;

    setTimeout(() => {
      this.success.set(false);

      const nextStep = this.taskService.getNextStep(id);
      const taskId = this.route.parent?.snapshot.params["taskId"];
      if (!taskId) return;

      if (!nextStep) {
        this.router
          .navigate(["/task", taskId, "results"])
          .then(() => console.debug("Route changed from SubtaskComponent"));
        this.taskService.currentTaskDone.set(true);
        return;
      }

      this.router
        .navigate(["/task", taskId, nextStep.id], {
          queryParams: { type: nextStep.type },
        })
        .then(() => console.debug("Route changed from SubtaskComponent"));
    }, 1000);
  }

  onNext() {
    const id = this.subTaskId();
    if (!id) return;

    const type = this.route.snapshot.queryParams["type"] as TaskStep["type"];

    this.taskService.checkStep(id, type, this.body()).subscribe({
      next: _res => {
        this.success.set(true);

        if ((type === 'info_slide' && !!this.infoSlide()?.popups.length)
          || (type === 'exclude_question' && !!this.excludeQuestion()?.popups.length)
          || (type === 'question_connect' && !!this.connectQuestion()?.popups.length)
          || (type === 'question_single_answer' && !!this.singleQuestion()?.popups.length)
          || (type === 'question_write' && !!this.writeQuestion()?.popups.length)) {
          return;
        }

        else {
          setTimeout(() => {
            this.success.set(false);

            const nextStep = this.taskService.getNextStep(id);
            const taskId = this.route.parent?.snapshot.params["taskId"];
            if (!taskId) return;

            if (!nextStep) {
              this.router
                .navigate(["/task", taskId, "results"])
                .then(() => console.debug("Route changed from SubtaskComponent"));
              this.taskService.currentTaskDone.set(true);
              return;
            }

            this.router
              .navigate(["/task", taskId, nextStep.id], {
                queryParams: { type: nextStep.type },
              })
              .then(() => console.debug("Route changed from SubtaskComponent"));
          }, 1000);
        }
      },
      error: err => {
        this.anyError.set(true);
        console.log(type === 'info_slide' && !!this.infoSlide()?.popups.length);
        setTimeout(() => {
          this.anyError.set(false);
        }, 2000);

        if (type === "question_connect") {
          this.connectQuestionError.set(err.error);
        } else if (type === "question_single_answer") {
          this.singleQuestionError.set(err.error);
        } else if (type === "exclude_question") {
          this.excludeQuestionError.set(err.error);
        }
      },
    });
  }
}
