/** @format */

import { Component, inject, Output, EventEmitter, Input } from "@angular/core";
import { IconComponent } from "@uilib";
import { CommonModule } from "@angular/common";
import { EditStep, ProjectStepService } from "../../../api/project/project-step.service";

@Component({
  selector: "app-project-navigation",
  templateUrl: "./project-navigation.component.html",
  styleUrl: "project-navigation.component.scss",
  imports: [IconComponent, CommonModule],
  standalone: true,
})
export class ProjectNavigationComponent {
  @Input() navItems!: any[];
  @Output() stepChange = new EventEmitter<EditStep>();

  private readonly projectStepService = inject(ProjectStepService);

  protected readonly currentStep = this.projectStepService.currentStep;

  onStepClick(step: EditStep): void {
    this.projectStepService.navigateToStep(step);
  }
}
