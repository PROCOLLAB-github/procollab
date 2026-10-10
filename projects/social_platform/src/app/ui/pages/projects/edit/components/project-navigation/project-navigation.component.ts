/** @format */

import { inject as injectReleaseLayout } from "@angular/core";
import { DesktopLayoutService as ReleaseDesktopLayoutService } from "../../../../../../../../../ui/src/lib/services/desktop-layout.service";

import {
  Component,
  inject,
  Output,
  EventEmitter,
  Input,
  ChangeDetectionStrategy,
  input,
  computed,
  output,
} from "@angular/core";
import { ProjectStepService } from "@api/project/project-step.service";
import { DesktopLayoutService, IconComponent, TabsComponent } from "@uilib";
import { CommonModule } from "@angular/common";
import { Navigation } from "@core/lib/models/navigation.model";
import { EditStep } from "@core/lib/models/edit-step";

/** Навигация по шагам формы проекта. */
@Component({
  selector: "app-project-navigation",
  templateUrl: "./project-navigation.component.html",
  styleUrl: "project-navigation.component.scss",
  imports: [TabsComponent, IconComponent, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectNavigationComponent {
  protected readonly releaseDesktop = injectReleaseLayout(ReleaseDesktopLayoutService).desktop;

  protected readonly desktopLayout = inject(DesktopLayoutService).desktop;
  readonly navItems = input.required<Navigation[]>();
  readonly stepChange = output<EditStep>();
  protected readonly tabs = computed(() =>
    this.navItems().map(item => ({ id: item.step, linkText: item.label, iconName: item.src })),
  );
  protected onTabSelected(step: string): void {
    this.onStepClick(step as EditStep);
  }

  private stepService = inject(ProjectStepService);

  protected readonly currentStep = this.stepService.currentStep;

  onStepClick(step: EditStep): void {
    this.stepChange.emit(step);
  }
}
