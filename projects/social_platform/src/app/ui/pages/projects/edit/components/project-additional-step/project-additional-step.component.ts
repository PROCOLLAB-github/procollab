/** @format */

import { CommonModule } from "@angular/common";
import { Component, computed, inject, ChangeDetectionStrategy } from "@angular/core";
import { isFailure, isLoading } from "@domain/shared/async-state";
import { ReactiveFormsModule } from "@angular/forms";
import {
  InputComponent,
  CheckboxComponent,
  SelectComponent,
  ButtonComponent,
} from "@ui/primitives";
import { TextareaComponent } from "@ui/primitives/textarea/textarea.component";
import { SwitchComponent } from "@ui/primitives/switch/switch.component";
import { ControlErrorPipe, ToSelectOptionsPipe } from "@corelib";
import { ErrorMessage } from "@core/lib/models/error/error-message";
import { RouterLink } from "@angular/router";
import { IconComponent } from "@uilib";
import { TooltipComponent } from "@ui/primitives/tooltip/tooltip.component";
import { ProjectAdditionalService } from "@api/project/facades/edit/project-additional.service";
import { TooltipInfoService } from "@api/tooltip/tooltip-info.service";
import { AppRoutes } from "@api/paths/app-routes";
import { PROGRAM_CASE_FIELD_NAME } from "@domain/program/program-case-field.const";

/** Шаг редактирования проекта: дополнительные поля программы. */
@Component({
  selector: "app-project-additional-step",
  templateUrl: "./project-additional-step.component.html",
  styleUrl: "./project-additional-step.component.scss",
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectAdditionalStepComponent {
  private readonly projectAdditionalService = inject(ProjectAdditionalService);
  private readonly tooltipInfoService = inject(TooltipInfoService);

  protected readonly isProjectAssignToProgram = this.projectAdditionalService.hasProgramLink;
  protected readonly pending = this.projectAdditionalService.pending;
  protected readonly loadFailed = this.projectAdditionalService.loadFailed;
  protected readonly submitted = this.projectAdditionalService.submitted;
  protected readonly saveError = this.projectAdditionalService.saveError;
  protected readonly caseError = this.projectAdditionalService.caseError;
  protected readonly caseFieldName = PROGRAM_CASE_FIELD_NAME;

  retry(): void {
    this.projectAdditionalService.retry();
  }

  setBooleanValue(name: string, value: boolean): void {
    this.projectAdditionalService.setBooleanValue(name, value);
  }

  protected readonly AppRoutes = AppRoutes;

  // Геттеры для получения данных из сервиса
  protected readonly additionalForm = this.projectAdditionalService.getAdditionalForm();

  protected readonly partnerProgramFields = this.projectAdditionalService.partnerProgramFields;
  protected readonly isSendingDecision = computed(() =>
    isLoading(this.projectAdditionalService.isSend$()),
  );

  protected readonly isAssignProjectToProgramError = computed(() =>
    isFailure(this.projectAdditionalService.isSend$()),
  );

  protected readonly errorAssignProjectToProgramModalMessage =
    this.projectAdditionalService.errorAssignProjectToProgramModalMessage;

  /** Наличие подсказки */
  protected readonly haveHint = this.tooltipInfoService.haveHint;

  /** Позиция подсказки */
  protected readonly tooltipPosition = this.tooltipInfoService.tooltipPosition;

  /** Состояние видимости подсказки */
  protected readonly isTooltipVisible = this.tooltipInfoService.isVisible;

  protected readonly errorMessage = ErrorMessage;

  /** Показать подсказку */
  toggleTooltip(): void {
    this.tooltipInfoService.toggleTooltip("base");
  }

  toggleAdditionalFormValues(
    fieldType: "text" | "textarea" | "checkbox" | "select" | "radio" | "file",
    fieldName: string,
  ): void {
    this.projectAdditionalService.toggleAdditionalFormValues(fieldType, fieldName);
  }
}
