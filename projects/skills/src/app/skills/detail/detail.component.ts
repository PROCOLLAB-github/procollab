/** @format */

import { AfterViewInit, Component, ElementRef, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TaskCardComponent } from "../../shared/task-card/task-card.component";
import { CircleProgressBarComponent } from "../../shared/circle-progress-bar/circle-progress-bar.component";
import { ActivatedRoute, Router } from "@angular/router";
import { map, Observable } from "rxjs";
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

  ngOnInit(): void {}

  blockHeight = signal(0);

  data = this.route.data.pipe(map(r => r["data"])) as Observable<SkillDetailResolve>;

  ngAfterViewInit() {
    this.blockHeight.set(this.elementRef.nativeElement.getBoundingClientRect().height);
  }
}
