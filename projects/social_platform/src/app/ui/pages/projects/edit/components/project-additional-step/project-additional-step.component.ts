/** @format */

import { CommonModule } from "@angular/common";
import {
  Component,
  computed,
  Input,
  OnInit,
  inject,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from "@angular/core";
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
import { ControlErrorPipe } from "@corelib";
import { ErrorMessage } from "@core/lib/models/error/error-message";
import { ToSelectOptionsPipe } from "@core/lib/pipes/transformers/options-transform.pipe";
import { RouterLink } from "@angular/router";
import { IconComponent } from "@uilib";
import { TooltipComponent } from "@ui/primitives/tooltip/tooltip.component";
import { ProjectAdditionalService } from "@api/project/facades/edit/project-additional.service";
import { TooltipInfoService } from "@api/tooltip/tooltip-info.service";

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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  protected readonly isSendingDecision = computed(() =>
    isLoading(this.projectAdditionalService.isSend$())
  );

  protected readonly isAssignProjectToProgramError = computed(() =>
    isFailure(this.projectAdditionalService.isSend$())
  );

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
