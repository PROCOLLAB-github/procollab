/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, Input, signal } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { TruncatePipe } from "projects/core/src/lib/pipes/truncate.pipe";
import { IconComponent, ButtonComponent } from "@ui/components";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";

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
export class CourseComponent {
  @Input() course!: any;

  router = inject(Router);

  protected readonly isStarted = signal<boolean>(false);
  protected readonly isDates = signal<boolean>(false);
  protected readonly isDate = signal<boolean>(false);
  protected readonly isEnded = signal<boolean>(false);

  protected readonly isMember = signal<boolean>(false);
  protected readonly isSubs = signal<boolean>(false);
}
