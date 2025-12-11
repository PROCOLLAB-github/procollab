/** @format */

import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Output } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ControlErrorPipe, ValidationService } from "@corelib";
import { ButtonComponent } from "@ui/components";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { QuickAnswers } from "projects/core/src/consts/other/quick-answers.const";
import { TagComponent } from "@ui/components/tag/tag.component";

@Component({
  selector: "app-cancel-task-form",
  templateUrl: "./cancel-task-form.component.html",
  styleUrl: "./cancel-task-form.component.scss",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    ControlErrorPipe,
    TextareaComponent,
    TagComponent,
  ],
  standalone: true,
})
export class CancelTaskFormComponent {
  @Output() submit = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly validationService = inject(ValidationService);

  constructor() {
    this.cancelTaskForm = this.fb.group({
      description: ["", Validators.required],
    });
  }

  errorMessage = ErrorMessage;
  cancelTaskForm: FormGroup;
  readonly quickAnswers = QuickAnswers;

  sendFormIsSubmitting = false;

  pickAnAnswer(title: string): void {
    const description = this.cancelTaskForm.get("description")?.value;
    this.cancelTaskForm.patchValue({
      description: (description.length ? description : null) + " " + title,
    });
  }

  onSubmit(event: Event): void {
    if (!this.validationService.getFormValidation(this.cancelTaskForm)) return;

    this.sendFormIsSubmitting = true;

    // TODO логика отправки формы для отмены выполнения задачи
    event.stopPropagation();
    this.submit.emit();
  }
}
