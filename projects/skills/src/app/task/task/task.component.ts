/** @format */

import {
  AfterViewInit,
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
import { map, tap } from "rxjs";
import { TaskStepsResponse } from "../../../models/skill.model";
import { ButtonComponent } from "@ui/components";
import { toSignal } from "@angular/core/rxjs-interop";

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

  route = inject(ActivatedRoute);
  router = inject(Router);

  skillStepsResponse = signal<TaskStepsResponse | null>(null);

  constructor() {
    effect(
      () => {
        const targetEl = this.pointEls?.find(el => {
          const id = el.nativeElement.dataset["id"];
          if (!id) return false;

          return Number(id) === this.currentSubTaskId();
        });
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
        const lastDoneStep = doneSteps[doneSteps.length - 1];
        if (lastDoneStep) {
          this.currentSubTaskId.set(lastDoneStep.id);
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
    this.route.data.pipe(map(r => r["data"])).subscribe(res => {
      this.skillStepsResponse.set(res);
    });

    this.route.firstChild?.params
      .pipe(
        map(r => r["subTaskId"]),
        map(Number)
      )
      .subscribe(s => {
        this.currentSubTaskId.set(s);
      });
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
