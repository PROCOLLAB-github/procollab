/** @format */

import { AfterViewInit, Component, ElementRef, inject, Input, OnInit, signal } from "@angular/core";
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
  @Input() data!: SkillDetailResolve;

  router = inject(Router);
  route = inject(ActivatedRoute);
  elementRef = inject(ElementRef<HTMLElement>);

  ngOnInit(): void {
    this.route.data.subscribe(r => {
      this.data = r['data']
    });
  }

  blockHeight = signal(0);

  ngAfterViewInit() {
    this.blockHeight.set(this.elementRef.nativeElement.getBoundingClientRect().height);
  }
}
