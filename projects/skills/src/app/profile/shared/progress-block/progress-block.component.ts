/** @format */

import { Component, HostListener, inject, Input, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CircleProgressBarComponent } from "../../../shared/circle-progress-bar/circle-progress-bar.component";
import { ActivatedRoute } from "@angular/router";
import { Skill } from "projects/skills/src/models/profile.model";

@Component({
  selector: "app-progress-block",
  standalone: true,
  imports: [CommonModule, CircleProgressBarComponent],
  templateUrl: "./progress-block.component.html",
  styleUrl: "./progress-block.component.scss",
})
export class ProgressBlockComponent implements OnInit {
  route = inject(ActivatedRoute);
  radius = 70;
  skillsList = signal<Skill[]>([]);
  hoveredIndex = -1;

  tooltipText = "В блоке «Прогресс» отображаются ваши топ-5 навыков, которые вы проходите";
  isHintVisible = false;

  @HostListener("mouseenter", ["$event"])
  onMouseEnter() {
    this.isHintVisible = true;
  }

  @HostListener("mouseleave", ["$event"])
  onMouseLeave() {
    this.isHintVisible = false;
  }

  calculateStrokeDashOffset(skillProgress: number): number {
    const circumference = 2 * Math.PI * this.radius;
    return circumference - (skillProgress / 100) * circumference;
  }

  calculateStrokeDashArray(): number {
    return 2 * Math.PI * this.radius;
  }

  ngOnInit(): void {
    this.route.data.subscribe(r => {
      this.skillsList.set(
        r["data"].skills.sort((a: any, b: any) => b.skillProgress - a.skillProgress)
      );
    });
  }

  getOpacity(index: number) {
    if (this.hoveredIndex === -1) {
      return 1;
    }
    return this.hoveredIndex === index ? 1 : 0.3;
  }
}
