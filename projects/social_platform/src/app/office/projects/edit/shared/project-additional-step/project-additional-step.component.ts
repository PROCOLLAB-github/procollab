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
import { ErrorMessage } from "@error/models/error-message";
import { ToSelectOptionsPipe } from "projects/core/src/lib/pipes/options-transform.pipe";
import { ProjectAdditionalService } from "../../services/project-additional.service";
import { PartnerProgramFields } from "@office/models/partner-program-fields.model";
import { RouterLink } from "@angular/router";
import { IconComponent } from "@uilib";

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
}
