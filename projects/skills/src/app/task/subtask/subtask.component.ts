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
import {
  ConnectQuestion,
  ExcludeQuestion,
  InfoSlide,
  SingleQuestion,
  StepType,
  TaskStep,
} from "../../../models/skill.model";
import { toSignal } from "@angular/core/rxjs-interop";

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
  ],
  templateUrl: "./subtask.component.html",
  styleUrl: "./subtask.component.scss",
})
export class SubtaskComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  taskService = inject(TaskService);

  taskType = this.route.queryParams.pipe(map(p => p["type"]));
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
  }

  setStepData(step: StepType) {
    const type = this.route.snapshot.queryParams["type"] as TaskStep["type"];

    this.singleQuestion.set(null);
    this.connectQuestion.set(null);
    this.infoSlide.set(null);
    this.excludeQuestion.set(null);

    if (type === "question_single_answer") {
      this.singleQuestion.set(step as SingleQuestion);
    } else if (type === "question_connect") {
      this.connectQuestion.set(step as ConnectQuestion);
    } else if (type === "info_slide") {
      this.infoSlide.set(step as InfoSlide);
    } else if (type === "exclude_question") {
      this.excludeQuestion.set(step as ExcludeQuestion);
    }
  }

  onNext() {
    const id = this.subTaskId();
    if (!id) return;

    const nextStep = this.taskService.getNextStep(id);
    if (!nextStep) return;

    this.router
      .navigate(["/task", this.route.parent?.snapshot.params["taskId"], nextStep.id], {
        queryParams: { type: nextStep.type },
      })
      .then(() => console.debug("Route changed from SubtaskComponent"));
  }
}
