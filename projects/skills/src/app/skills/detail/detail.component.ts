/** @format */

import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { map } from "rxjs";
import { CircleProgressBarComponent } from "../../shared/circle-progress-bar/circle-progress-bar.component";
import { TaskCardComponent } from "../../shared/task-card/task-card.component";
import { SkillDetailResolve } from "./detail.resolver";

@Component({
  selector: "app-detail",
  standalone: true,
  imports: [CommonModule, TaskCardComponent, CircleProgressBarComponent],
  templateUrl: "./detail.component.html",
  styleUrl: "./detail.component.scss",
})
export class SkillDetailComponent implements OnInit, AfterViewInit {
  protected readonly Array = Array;

  router = inject(Router);
  route = inject(ActivatedRoute);
  elementRef = inject(ElementRef<HTMLElement>);

  ngOnInit(): void {
    this.route.data.pipe(map(r => r["data"])).subscribe(data => {
      this.data.set(data);
      this.tasksData.set(data[0]);
    });
  }

  blockHeight = signal(0);

  data = signal<SkillDetailResolve | null>(null);
  tasksData = signal<SkillDetailResolve[0] | null>(null);

  doneWeeks = computed(() => {
    const data = this.data();
    if (!data) return [];

    return data[0].statsOfWeeks.filter(s => s.isDone);
  });

  ngAfterViewInit() {
    this.blockHeight.set(this.elementRef.nativeElement.getBoundingClientRect().height);
  }
}
