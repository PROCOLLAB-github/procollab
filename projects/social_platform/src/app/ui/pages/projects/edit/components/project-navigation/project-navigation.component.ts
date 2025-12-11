/** @format */

import { Component, inject, Output, EventEmitter } from "@angular/core";
import { EditStep, ProjectStepService } from "../../../../../../api/project/project-step.service";
import { IconComponent } from "@uilib";
import { CommonModule } from "@angular/common";
import { navProjectItems } from "projects/core/src/consts/navigation/nav-project-items.const";

@Component({
  selector: "app-project-navigation",
  templateUrl: "./project-navigation.component.html",
  styleUrl: "project-navigation.component.scss",
  standalone: true,
  imports: [IconComponent, CommonModule],
})
export class ProjectNavigationComponent {
  @Output() stepChange = new EventEmitter<EditStep>();

  readonly navProjectItems = navProjectItems;
  private stepService = inject(ProjectStepService);

  currentStep = this.stepService.getCurrentStep();

  onStepClick(step: EditStep): void {
    this.stepChange.emit(step);
  }
}
