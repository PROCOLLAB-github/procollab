/** @format */

import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, Output, WritableSignal } from "@angular/core";
import { AvatarComponent } from "@ui/components/avatar/avatar.component";
import { ButtonComponent, IconComponent } from "@ui/components";
import { UserLinksPipe } from "projects/core/src/lib/pipes/user/user-links.pipe";
import { TruncatePipe } from "projects/core/src/lib/pipes/formatters/truncate.pipe";
import { CapitalizePipe } from "projects/core/src/lib/pipes/formatters/capitalize.pipe";
import { RouterModule } from "@angular/router";
import { Vacancy } from "projects/social_platform/src/app/domain/vacancy/vacancy.model";
import { SalaryTransformPipe } from "projects/core/src/lib/pipes/transformers/salary-transform.pipe";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { UploadFileComponent } from "@ui/components/upload-file/upload-file.component";
import { ControlErrorPipe } from "@corelib";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { VacancyDetailUIInfoService } from "projects/social_platform/src/app/api/vacancy/facades/ui/vacancy-detail-ui-info.service";
import { VacancyDetailInfoService } from "projects/social_platform/src/app/api/vacancy/facades/vacancy-detail-info.service";
import { ReactiveFormsModule } from "@angular/forms";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";

@Component({
  selector: "app-vacancies-right-side",
  templateUrl: "./vacancies-right-side.component.html",
  styleUrl: "./vacancies-right-side.component.scss",
  imports: [
    CommonModule,
    AvatarComponent,
    ButtonComponent,
    ReactiveFormsModule,
    RouterModule,
    UserLinksPipe,
    TruncatePipe,
    CapitalizePipe,
    IconComponent,
    SalaryTransformPipe,
  ],
  standalone: true,
})
export class VacanciesRightSideComponent {
  @Input() vacancy!: WritableSignal<Vacancy | undefined>;
  @Output() sendResponse = new EventEmitter<void>();

  onSendResponseClick(): void {
    this.sendResponse.emit();
  }
}
