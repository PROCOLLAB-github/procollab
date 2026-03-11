/** @format */

import { CommonModule } from "@angular/common";
import { Component, Input, OnInit, signal } from "@angular/core";
import { RouterModule } from "@angular/router";
import { TruncatePipe } from "projects/core/src/lib/pipes/truncate.pipe";
import { IconComponent, ButtonComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { CourseCard } from "@office/models/courses.model";

/**
 * Компонент отображения карточки траектории
 * Показывает информацию о траектории: название, описание, навыки, длительность
 * Поддерживает различные модальные окна для взаимодействия с пользователем
 * Обрабатывает выбор траектории и навигацию к детальной информации
 *
 * @Input trajectory - объект траектории для отображения
 */
@Component({
  selector: "app-course",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TruncatePipe,
    IconComponent,
    AvatarComponent,
    ButtonComponent,
    IconComponent,
  ],
  templateUrl: "./course.component.html",
  styleUrl: "./course.component.scss",
})
export class CourseComponent implements OnInit {
  @Input() course!: CourseCard;

  ngOnInit(): void {
    this.accessType();
    this.actions();
  }

  protected readonly isLock = signal<boolean>(false);

  protected readonly isMember = signal<boolean>(false);
  protected readonly isSubs = signal<boolean>(false);

  private accessType() {
    switch (this.course.accessType) {
      case "program_members": {
        this.isMember.set(true);
        break;
      }

      case "subscription_stub":
        this.isSubs.set(true);
        break;
    }
  }

  private actions() {
    switch (this.course.actionState) {
      case "lock": {
        this.isLock.set(true);
        break;
      }
    }
  }
}
