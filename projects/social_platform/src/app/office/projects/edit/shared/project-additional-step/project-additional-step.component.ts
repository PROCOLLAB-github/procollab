/** @format */

import { CommonModule } from "@angular/common";
import { Component, Input, OnInit, inject, ChangeDetectorRef } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { InputComponent, CheckboxComponent, SelectComponent } from "@ui/components";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { SwitchComponent } from "@ui/components/switch/switch.component";
import { ControlErrorPipe } from "@corelib";
import { ErrorMessage } from "@error/models/error-message";
import { ToSelectOptionsPipe } from "projects/core/src/lib/pipes/options-transform.pipe";
import { ProjectAdditionalService } from "../../services/project-additional.service";
import { PartnerProgramFields } from "@office/models/partner-program-fields.model";

@Component({
  selector: "app-project-additional-step",
  templateUrl: "./project-additional-step.component.html",
  styleUrl: "./project-additional-step.component.scss",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    CheckboxComponent,
    SwitchComponent,
    SelectComponent,
    TextareaComponent,
    ControlErrorPipe,
    ToSelectOptionsPipe,
  ],
})
export class ProjectAdditionalStepComponent implements OnInit {
  @Input() programTagsOptions: any[] = [];

  private readonly projectAdditionalService = inject(ProjectAdditionalService);
  private readonly cdRef = inject(ChangeDetectorRef);

  readonly errorMessage = ErrorMessage;

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

  /**
   * Валидация дополнительных полей для публикации
   * @returns true если есть ошибки валидации
   */
  validateAdditionalFields(): boolean {
    if (!this.partnerProgramFields?.length) {
      return false;
    }

    const hasInvalid = this.projectAdditionalService.validateRequiredFields();

    if (hasInvalid) {
      this.cdRef.markForCheck();
      return true;
    }

    // Подготавливаем поля для отправки
    this.projectAdditionalService.prepareFieldsForSubmit();
    return false;
  }

  /**
   * Отправка дополнительных полей
   * @param projectId - ID проекта
   * @param onSuccess - колбэк при успешной отправке
   * @param onError - колбэк при ошибке
   */
  sendAdditionalFields(
    projectId: number,
    onSuccess?: () => void,
    onError?: (error: any) => void
  ): void {
    this.projectAdditionalService.sendAdditionalFieldsValues(projectId).subscribe({
      next: () => {
        this.projectAdditionalService.resetSendingState();
        onSuccess?.();
      },
      error: error => {
        this.projectAdditionalService.resetSendingState();
        console.error("Error sending additional fields:", error);
        onError?.(error);
      },
    });
  }

  /**
   * Закрытие модального окна решения
   * @param projectId - ID проекта
   * @param onComplete - колбэк при завершении
   */
  closeSendingDecisionModal(projectId: number, onComplete?: () => void): void {
    this.sendAdditionalFields(projectId, onComplete, error =>
      console.error("Failed to send additional fields:", error)
    );
  }
}
