/** @format */

import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from "@angular/router";
import { map } from "rxjs";
import { TaskStepsResponse } from "../../../models/skill.model";
import { ButtonComponent } from "@ui/components";
import { TaskService } from "../services/task.service";

@Component({
  selector: "app-task",
  standalone: true,
  imports: [CommonModule, RouterOutlet, ButtonComponent, RouterLink],
  templateUrl: "./task.component.html",
  styleUrl: "./task.component.scss",
})
export class TaskComponent implements OnInit {
  @ViewChildren("pointEls") pointEls?: ElementRef<HTMLAnchorElement>[];
  @ViewChild("progressBarEl") progressBarEl?: ElementRef<HTMLElement>;
  @ViewChild("progressDone") progressDone?: ElementRef<HTMLElement>;

  route = inject(ActivatedRoute);
  router = inject(Router);
  taskService = inject(TaskService);

  skillStepsResponse = signal<TaskStepsResponse | null>(null);

  constructor() {
    effect(
      () => {
        const targetEl = !this.taskService.currentTaskDone()
          ? this.pointEls?.find(el => {
            const subTaskPointId = el.nativeElement.dataset["id"];
            if (!subTaskPointId) return false;

            return Number(subTaskPointId) === this.currentSubTaskId();
          })
          : this.progressDone;

        if (targetEl && this.progressBarEl) {
          const { left: leftParent } = this.progressBarEl.nativeElement.getBoundingClientRect();
          const { left: leftChild } = targetEl.nativeElement.getBoundingClientRect();

          const left = leftChild - leftParent;
          this.progressDoneWidth.set(left);
        }
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        const skillsResponse = this.skillStepsResponse();
        if (!skillsResponse) return;

        // TODO: change `id` to `order` after backend add it
        const sortedSteps = skillsResponse.stepData.sort((prev, next) => prev.id - next.id);

        const doneSteps = sortedSteps.filter(step => step.isDone);
        if (doneSteps.length === sortedSteps.length) return;

        const lastDoneStep = sortedSteps[doneSteps.length];
        if (lastDoneStep) {
          this.currentSubTaskId.set(lastDoneStep.id);
          return;
        }

        const firstStep = sortedSteps[0];
        this.currentSubTaskId.set(firstStep.id);
      },
      { allowSignalWrites: true }
    );

    effect(() => {
      const subTaskId = this.currentSubTaskId();
      if (!subTaskId) return;

      this.router
        .navigate(["/task", this.route.snapshot.params["taskId"], subTaskId], {
          queryParams: { type: this.currentSubTask()?.type ?? "" },
        })
        .then(() => console.debug("Route changed from TaskComponent"));
    });
  }

  ngOnInit() {
    this.route.data.pipe(map(r => r["data"])).subscribe((res: TaskStepsResponse) => {
      this.skillStepsResponse.set(res);

      if (res.stepData.filter(s => s.isDone).length === res.stepData.length) {
        this.taskService.currentTaskDone.set(true);
        this.router.navigate(["/task", this.route.snapshot.params["taskId"], "results"]);
      }
    });

    this.route.firstChild?.params
      .pipe(
        map(r => r["subTaskId"]),
        map(Number)
      )
      .subscribe(s => {
        this.currentSubTaskId.set(s);
      });

    this.route.firstChild?.url.subscribe(console.log);
  }

  goToTask(id: number) {
    if (this.taskService.currentTaskDone()) return;
    this.currentSubTaskId.set(id);
  }

  progressDoneWidth = signal(0);

  taskIds = computed(() => {
    const stepsResponse = this.skillStepsResponse();
    if (!stepsResponse) return [];

    return stepsResponse.stepData.map(s => s.id);
  });

  currentSubTaskId = signal<number | null>(null);

  currentSubTask = computed(() => {
    const stepsResponse = this.skillStepsResponse();
    const subTaskId = this.currentSubTaskId();

    if (!stepsResponse || !subTaskId) return;

    return stepsResponse.stepData.find(step => step.id === subTaskId);
  });

  doneTasks = computed(() => {
    const subTaskId = this.currentSubTaskId();
    if (!subTaskId) return [];

    return this.taskIds()?.filter(t => t <= subTaskId);
  });
}
