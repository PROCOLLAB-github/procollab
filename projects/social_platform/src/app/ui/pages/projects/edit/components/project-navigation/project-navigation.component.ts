/** @format */

import { Component, inject, Output, EventEmitter, Input } from "@angular/core";
import { EditStep, ProjectStepService } from "../../../../../../api/project/project-step.service";
import { IconComponent } from "@uilib";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-project-navigation",
  templateUrl: "./project-navigation.component.html",
  styleUrl: "project-navigation.component.scss",
  standalone: true,
  imports: [IconComponent, CommonModule],
})
export class ProjectNavigationComponent {
  @Input() navItems: any;
  @Output() stepChange = new EventEmitter<EditStep>();

  private stepService = inject(ProjectStepService);

  protected readonly currentStep = this.stepService.currentStep;

  onStepClick(step: EditStep): void {
    this.stepChange.emit(step);
  }
}
