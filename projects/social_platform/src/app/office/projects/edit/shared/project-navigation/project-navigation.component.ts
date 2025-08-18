/** @format */

import { Component, inject, Output, EventEmitter } from "@angular/core";
import { EditStep, ProjectStepService } from "../../services/project-step.service";
import { navItems } from "projects/core/src/consts/navProjectItems";

@Component({
  selector: "app-project-navigation",
  templateUrl: "./project-navigation.component.html",
  styleUrl: "project-navigation.component.scss",
  standalone: true,
})
export class ProjectNavigationComponent {
  @Output() stepChange = new EventEmitter<EditStep>();

  readonly navItems = navItems;
  private stepService = inject(ProjectStepService);

  currentStep = this.stepService.getCurrentStep();

  onStepClick(step: EditStep): void {
    this.stepChange.emit(step);
  }
}
