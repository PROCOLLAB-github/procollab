/** @format */

import { CommonModule } from "@angular/common";
import { Component, Input, OnInit, inject, ChangeDetectorRef } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
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
import { ProjectAdditionalService } from "../../../../../../api/project/project-additional.service";
import { PartnerProgramFields } from "projects/social_platform/src/app/domain/program/partner-program-fields.model";
import { RouterLink } from "@angular/router";
import { IconComponent } from "@uilib";
import { TooltipComponent } from "@ui/components/tooltip/tooltip.component";

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
  private readonly cdRef = inject(ChangeDetectorRef);

  readonly errorMessage = ErrorMessage;

  @Input() isProjectAssignToProgram?: boolean;

  ngOnInit(): void {
    // Инициализация уже должна быть выполнена в родительском компоненте
    this.cdRef.detectChanges();
  }

  // Геттеры для получения данных из сервиса
  get additionalForm(): FormGroup {
    return this.projectAdditionalService.getAdditionalForm();
  }

  get partnerProgramFields(): PartnerProgramFields[] {
    return this.projectAdditionalService.getPartnerProgramFields();
  }

  get isSendingDecision() {
    return this.projectAdditionalService.getIsSendingDecision();
  }

  get isAssignProjectToProgramError() {
    return this.projectAdditionalService.getIsAssignProjectToProgramError();
  }

  get errorAssignProjectToProgramModalMessage() {
    return this.projectAdditionalService.getErrorAssignProjectToProgramModalMessage();
  }

  /** Наличие подсказки */
  haveHint = false;

  /** Текст для подсказки */
  tooltipText?: string;

  /** Позиция подсказки */
  tooltipPosition: "left" | "right" = "right";

  /** Состояние видимости подсказки */
  isTooltipVisible = false;

  /** Показать подсказку */
  showTooltip(): void {
    this.isTooltipVisible = true;
  }

  /** Скрыть подсказку */
  hideTooltip(): void {
    this.isTooltipVisible = false;
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
