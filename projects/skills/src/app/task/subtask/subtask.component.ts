/** @format */

import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { InfoTaskComponent } from "../shared/video-task/info-task.component";
import { RadioSelectTaskComponent } from "../shared/radio-select-task/radio-select-task.component";
import { RelationsTaskComponent } from "../shared/relations-task/relations-task.component";
import { ButtonComponent } from "@ui/components";
import { ExcludeTaskComponent } from "../shared/exclude-task/exclude-task.component";
import { ActivatedRoute, RouterLink } from "@angular/router";
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
  taskService = inject(TaskService);

  taskType = this.route.queryParams.pipe(map(p => p["type"]));
  loading = signal(false);

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
          return this.taskService.getStep(subTaskId, this.route.snapshot.queryParams["type"]);
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
}
