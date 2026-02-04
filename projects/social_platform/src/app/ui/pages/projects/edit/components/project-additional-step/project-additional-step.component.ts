/** @format */

import { CommonModule } from "@angular/common";
import { Component, Input, OnInit, inject, ChangeDetectorRef } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import {
  InputComponent,
  CheckboxComponent,
  SelectComponent,
  ButtonComponent,
} from "@ui/components";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { SwitchComponent } from "@ui/components/switch/switch.component";
import { ControlErrorPipe } from "@corelib";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { ToSelectOptionsPipe } from "projects/core/src/lib/pipes/transformers/options-transform.pipe";
import { RouterLink } from "@angular/router";
import { IconComponent } from "@uilib";
import { TooltipComponent } from "@ui/components/tooltip/tooltip.component";
import { ProjectAdditionalService } from "projects/social_platform/src/app/api/project/facades/edit/project-additional.service";
import { TooltipInfoService } from "projects/social_platform/src/app/api/tooltip/tooltip-info.service";

@Component({
  selector: "app-project-additional-step",
  templateUrl: "./project-additional-step.component.html",
  styleUrl: "./project-additional-step.component.scss",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    IconComponent,
    CheckboxComponent,
    SwitchComponent,
    SelectComponent,
    TextareaComponent,
    ControlErrorPipe,
    ToSelectOptionsPipe,
    ButtonComponent,
    RouterLink,
    TooltipComponent,
  ],
})
export class ProjectAdditionalStepComponent implements OnInit {
  private readonly projectAdditionalService = inject(ProjectAdditionalService);
  private readonly tooltipInfoService = inject(TooltipInfoService);

  private readonly cdRef = inject(ChangeDetectorRef);

  @Input() isProjectAssignToProgram?: boolean;

  ngOnInit(): void {
    // Инициализация уже должна быть выполнена в родительском компоненте
    this.cdRef.detectChanges();
  }

  // Геттеры для получения данных из сервиса
  protected readonly additionalForm = this.projectAdditionalService.getAdditionalForm();

  protected readonly partnerProgramFields = this.projectAdditionalService.partnerProgramFields;
  protected readonly isSendingDecision = this.projectAdditionalService.isSendingDecision;

  protected readonly isAssignProjectToProgramError =
    this.projectAdditionalService.isAssignProjectToProgramError;

  protected readonly errorAssignProjectToProgramModalMessage =
    this.projectAdditionalService.errorAssignProjectToProgramModalMessage;

  /** Наличие подсказки */
  protected readonly haveHint = this.tooltipInfoService.haveHint;

  /** Позиция подсказки */
  protected readonly tooltipPosition = this.tooltipInfoService.tooltipPosition;

  /** Состояние видимости подсказки */
  protected readonly isTooltipVisible = this.tooltipInfoService.isTooltipVisible;

  protected readonly errorMessage = ErrorMessage;

  /** Показать подсказку */
  toggleTooltip(option: "show" | "hide"): void {
    option === "show"
      ? this.tooltipInfoService.showTooltip()
      : this.tooltipInfoService.hideTooltip();
  }

  /**
   * Переключение значения для checkbox и radio полей
   * @param fieldType - тип поля
   * @param fieldName - имя поля
   */
  toggleAdditionalFormValues(
    fieldType: "text" | "textarea" | "checkbox" | "select" | "radio" | "file",
    fieldName: string
  ): void {
    this.projectAdditionalService.toggleAdditionalFormValues(fieldType, fieldName);
  }
}
