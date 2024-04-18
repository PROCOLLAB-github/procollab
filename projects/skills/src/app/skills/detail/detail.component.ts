/** @format */

import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChildren,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { TaskCardComponent } from "../../shared/task-card/task-card.component";
import { CircleProgressBarComponent } from "../../shared/circle-progress-bar/circle-progress-bar.component";
import { Router } from "@angular/router";

@Component({
  selector: "app-detail",
  standalone: true,
  imports: [CommonModule, TaskCardComponent, CircleProgressBarComponent],
  templateUrl: "./detail.component.html",
  styleUrl: "./detail.component.scss",
})
export class SkillDetailComponent implements OnInit, AfterViewInit {
  protected readonly Array = Array;

  radius = signal(0);
  router = inject(Router);
  elementRef = inject(ElementRef<HTMLElement>);

  ngOnInit(): void {
    setTimeout(() => {
      this.radius.set(70);
    }, 2000);
  }

  blockHeight = signal(0);
  ngAfterViewInit() {
    this.blockHeight.set(this.elementRef.nativeElement.getBoundingClientRect().height);
  }
}
