/** @format */

import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarComponent } from "@uilib";
import { PluralizePipe } from "@corelib";
import { IconComponent } from "@ui/components";
import { CircleProgressBarComponent } from "../circle-progress-bar/circle-progress-bar.component";
import { CourseModule } from "@office/models/courses.model";

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
    AvatarComponent,
    PluralizePipe,
    CircleProgressBarComponent,
    IconComponent,
  ],
  templateUrl: "./course-module-card.component.html",
  styleUrl: "./course-module-card.component.scss",
})
export class CourseModuleCardComponent {
  @Input({ required: true }) courseModule!: CourseModule;
  @Input() type: "personal" | "base" = "base";

  isExpanded = false;

  toggleExpand(event: Event): void {
    event.stopPropagation();
    this.isExpanded = !this.isExpanded;
  }

  getTopics(): any[] {
    const mockTopics: any[] = [
      { name: "Основы программирования", levels: 5 },
      { name: "Структуры данных", levels: 5 },
      { name: "Алгоритмы и оптимизация", levels: 5 },
      { name: "Работа с базами данных", levels: 5 },
      { name: "Веб-разработка", levels: 5 },
      { name: "Тестирование и отладка", levels: 5 },
    ];

    return mockTopics;
  }
}
