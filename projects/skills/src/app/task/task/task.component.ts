/** @format */

import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  signal,
  ViewChildren,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-task",
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: "./task.component.html",
  styleUrl: "./task.component.scss",
})
export class TaskComponent implements AfterViewInit {
  @ViewChildren("pointEls") pointEls?: ElementRef<HTMLAnchorElement>[];

  ngAfterViewInit() {
    const targetEl = this.pointEls?.find(el => {
      const id = el.nativeElement.dataset["id"];
      if (!id) return false;

      return Number(id) === this.currentTaskId();
    });
    if (targetEl) {
      const left = targetEl.nativeElement.offsetLeft;
      this.progressDoneWidth.set(left);
    }
  }

  progressDoneWidth = signal(0);

  taskIds = signal(
    Array(10)
      .fill(null)
      .map((_, i) => i)
  );

  currentTaskId = signal(3);

  doneTasks = computed(() => {
    return this.taskIds().filter(t => t <= this.currentTaskId());
  });
}
