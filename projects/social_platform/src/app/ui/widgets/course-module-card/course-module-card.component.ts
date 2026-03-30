/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarComponent } from "@uilib";
import { PluralizePipe } from "@corelib";
import { IconComponent } from "@ui/primitives";
import { CircleProgressBarComponent } from "@ui/primitives/circle-progress-bar/circle-progress-bar.component";
import { CourseDetail, CourseModule } from "@domain/courses/courses.model";
import { RouterLink } from "@angular/router";

/**
 * Компонент карточки навыка
 *
 * Отображает краткую информацию о навыке в виде карточки
 *
 * @Input skill - Объект с данными навыка (обязательный)
 * @Input type - Тип отображения карточки: 'personal' | 'base' (по умолчанию 'base')
 *
 * Функциональность:
 * - Отображение основной информации о навыке
 * - Поддержка двух визуальных стилей
 * - Индикация статуса навыка (подписка, просрочка, выполнение)
 * - Плюрализация для количества уровней
 * - Раскрывающийся список тем и действий
 */
@Component({
  selector: "app-course-module-card",
  standalone: true,
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
})
export class CourseModuleCardComponent {
  @Input({ required: true }) courseModule!: CourseModule;
  @Input() type: "personal" | "base" = "base";

  isExpanded = false;

  toggleExpand(event: Event): void {
    if (this.courseModule.lessons.length) {
      event.stopPropagation();
      this.isExpanded = !this.isExpanded;
    }
  }
}
