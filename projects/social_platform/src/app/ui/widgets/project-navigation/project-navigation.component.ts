/** @format */

import {
  Component,
  inject,
  Output,
  EventEmitter,
  Input,
  ChangeDetectionStrategy,
  input,
} from "@angular/core";
import { IconComponent } from "@uilib";
import { CommonModule } from "@angular/common";
import { ProjectStepService } from "@api/project/project-step.service";
import { Navigation } from "@core/lib/models/navigation.model";
import { EditStep } from "@core/public-api";

/** Виджет навигации по разделам проекта. */
@Component({
  selector: "app-project-navigation",
  templateUrl: "./project-navigation.component.html",
  styleUrl: "project-navigation.component.scss",
  imports: [IconComponent, CommonModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectNavigationComponent {
  readonly navItems = input.required<Navigation[]>();
  @Output() stepChange = new EventEmitter<EditStep>();

  private readonly projectStepService = inject(ProjectStepService);

  protected readonly currentStep = this.projectStepService.currentStep;

  onStepClick(step: EditStep): void {
    this.projectStepService.navigateToStep(step);
  }
}
