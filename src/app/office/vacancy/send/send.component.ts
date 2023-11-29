/** @format */

import { Component, OnInit } from "@angular/core";
import { AuthService } from "@auth/services";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { ErrorMessage } from "@error/models/error-message";
import { VacancyService } from "@services/vacancy.service";
import { ValidationService } from "@core/services";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { NavService } from "@services/nav.service";
import { UserRolePipe } from "@core/pipes/user-role.pipe";
import { ControlErrorPipe } from "@core/pipes/control-error.pipe";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { TagComponent } from "@ui/components/tag/tag.component";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { ButtonComponent, IconComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { NgIf, NgFor, AsyncPipe } from "@angular/common";
import { BackComponent } from "@ui/components/back/back.component";

@Component({
  selector: "app-send",
  templateUrl: "./send.component.html",
  styleUrl: "./send.component.scss",
  standalone: true,
  imports: [
    BackComponent,
    NgIf,
    ModalComponent,
    IconComponent,
    RouterLink,
    ButtonComponent,
    AvatarComponent,
    NgFor,
    TagComponent,
    ReactiveFormsModule,
    TextareaComponent,
    AsyncPipe,
    ControlErrorPipe,
    UserRolePipe,
  ],
})
export class VacancySendComponent implements OnInit {
  constructor(
    public readonly authService: AuthService,
    private readonly fb: FormBuilder,
    private readonly vacancyService: VacancyService,
    private readonly validationService: ValidationService,
    private readonly route: ActivatedRoute,
    private readonly navService: NavService
  ) {
    this.sendForm = this.fb.group({
      whyMe: ["", [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
    });
  }

  ngOnInit(): void {
    this.navService.setNavTitle("Отклик на вакансию");
  }

  errorMessage = ErrorMessage;
  sendForm: FormGroup;
  sendFormIsSubmitting = false;

  resultModal = false;

  onSubmit(): void {
    if (!this.validationService.getFormValidation(this.sendForm)) {
      return;
    }

    this.sendFormIsSubmitting = true;

    this.vacancyService
      .sendResponse(Number(this.route.snapshot.paramMap.get("vacancyId")), this.sendForm.value)
      .subscribe({
        next: () => {
          this.sendFormIsSubmitting = false;
          this.resultModal = true;
        },
        error: () => {
          this.sendFormIsSubmitting = false;
        },
      });
  }
}
