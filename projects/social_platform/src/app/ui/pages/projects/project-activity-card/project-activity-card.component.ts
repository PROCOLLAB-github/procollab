/** @format */

import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { ProjectCount, ProjectCountLoadState } from "@domain/project/project.model";
import { IconComponent } from "@ui/primitives/icon/icon.component";

interface ProjectActivityMetric {
  icon: string;
  label: string;
  value: number;
}

/** Компактная информационная карточка проектной активности текущего пользователя. */
@Component({
  selector: "app-project-activity-card",
  templateUrl: "./project-activity-card.component.html",
  styleUrl: "./project-activity-card.component.scss",
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectActivityCardComponent {
  readonly count = input.required<ProjectCount>();
  readonly state = input.required<ProjectCountLoadState>();

  protected readonly metrics = computed<ProjectActivityMetric[]>(() => [
    { icon: "projects", label: "Проектов", value: this.count().my },
    { icon: "person", label: "Я лидер", value: this.count().myLeader },
    { icon: "program", label: "В программе", value: this.count().myInProgram },
    { icon: "check", label: "Сдано", value: this.count().mySubmitted },
  ]);

  protected readonly isLoaded = computed(() => this.state() === "loaded");
  protected readonly placeholderLabel = computed(() =>
    this.state() === "error" ? "Данные временно недоступны" : "Загрузка данных",
  );
}
