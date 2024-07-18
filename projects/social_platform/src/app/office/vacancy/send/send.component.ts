/** @format */

import { Component, OnInit } from "@angular/core";
import { AuthService } from "@auth/services";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ErrorMessage } from "@error/models/error-message";
import { VacancyService } from "@services/vacancy.service";
import { ControlErrorPipe, ValidationService } from "projects/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { NavService } from "@services/nav.service";
import { UserRolePipe } from "@core/pipes/user-role.pipe";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { TagComponent } from "@ui/components/tag/tag.component";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { BarComponent, ButtonComponent, IconComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { AsyncPipe } from "@angular/common";
import { BackComponent } from "@uilib";
import { UploadFileComponent } from "@ui/components/upload-file/upload-file.component";

@Component({
  selector: "app-send",
  templateUrl: "./send.component.html",
  styleUrl: "./send.component.scss",
  standalone: true,
  imports: [
    ModalComponent,
    IconComponent,
    RouterLink,
    ButtonComponent,
    AvatarComponent,
    TagComponent,
    ReactiveFormsModule,
    TextareaComponent,
    AsyncPipe,
    ControlErrorPipe,
    UserRolePipe,
    BarComponent,
    UploadFileComponent,
  ],
})
export class VacancySendComponent implements OnInit {
  constructor(
    public readonly authService: AuthService,
    private readonly fb: FormBuilder,
    private readonly vacancyService: VacancyService,
    private readonly validationService: ValidationService,
    private readonly route: ActivatedRoute,
    private readonly navService: NavService,
  ) {
    this.sendForm = this.fb.group({
      whyMe: ["", [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
      accompanyingFile: ["", [Validators.required]],
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
