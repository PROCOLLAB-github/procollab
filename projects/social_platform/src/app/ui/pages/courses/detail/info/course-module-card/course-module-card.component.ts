/** @format */

import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarComponent } from "@uilib";
import { PluralizePipe } from "@corelib";
import { IconComponent } from "@ui/primitives";
import { CircleProgressBarComponent } from "./circle-progress-bar/circle-progress-bar.component";
import { CourseModule } from "@domain/courses/courses.model";
import { RouterLink } from "@angular/router";

/** Карточка модуля курса с прогрессом и списком уроков. */
@Component({
  selector: "app-course-module-card",
  imports: [
    CommonModule,
    CircleProgressBarComponent,
    IconComponent,
    RouterLink,
    PluralizePipe,
    AvatarComponent,
  ],
  templateUrl: "./course-module-card.component.html",
  styleUrl: "./course-module-card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseModuleCardComponent {
  readonly courseModule = input.required<CourseModule>();
  readonly type = input<"personal" | "base">("base");

  isExpanded = false;

  toggleExpand(event: Event): void {
    if (this.courseModule().lessons.length) {
      event.stopPropagation();
      this.isExpanded = !this.isExpanded;
    }
  }
}
