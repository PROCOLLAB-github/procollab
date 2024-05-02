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
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { map } from "rxjs";
import { TaskStepsResponse } from "../../../models/skill.model";

@Component({
  selector: "app-task",
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: "./task.component.html",
  styleUrl: "./task.component.scss",
})
export class TaskComponent implements OnInit, AfterViewInit {
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

          return Number(id) === this.currentTaskId();
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
  }

  ngOnInit() {
    this.route.data.pipe(map(r => r["data"])).subscribe(res => {
      this.skillStepsResponse.set(res);

      if (!this.skillStepsResponse()) return;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const doneIdx = this.skillStepsResponse().stepData.filter(s => s.isDone).length - 1;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.currentTaskId.set(this.skillStepsResponse().stepData[doneIdx].id);

      this.router.navigate([this.currentTaskId()], { relativeTo: this.route });
    });
  }

  ngAfterViewInit() {}

  progressDoneWidth = signal(0);

  taskIds = computed(() => {
    return this.skillStepsResponse()?.stepData.map(s => s.id);
  });

  currentTaskId = signal(1);

  doneTasks = computed(() => {
    return this.taskIds()?.filter(t => t <= this.currentTaskId());
  });
}
