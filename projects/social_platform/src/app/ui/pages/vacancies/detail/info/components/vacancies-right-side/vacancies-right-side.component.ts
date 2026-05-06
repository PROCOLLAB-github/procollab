/** @format */

import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  WritableSignal,
} from "@angular/core";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { ButtonComponent, IconComponent } from "@ui/primitives";
import { UserLinksPipe } from "@core/lib/pipes/user/user-links.pipe";
import { TruncatePipe } from "@core/lib/pipes/formatters/truncate.pipe";
import { CapitalizePipe } from "@core/lib/pipes/formatters/capitalize.pipe";
import { RouterModule } from "@angular/router";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { SalaryTransformPipe } from "@core/lib/pipes/transformers/salary-transform.pipe";
import { TextareaComponent } from "@ui/primitives/textarea/textarea.component";
import { UploadFileComponent } from "@ui/primitives/upload-file/upload-file.component";
import { ControlErrorPipe } from "@corelib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { VacancyDetailUIInfoService } from "@api/vacancy/facades/ui/vacancy-detail-ui-info.service";
import { VacancyDetailInfoService } from "@api/vacancy/facades/vacancy-detail-info.service";
import { ReactiveFormsModule } from "@angular/forms";
import { ErrorMessage } from "@core/lib/models/error/error-message";

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VacanciesRightSideComponent {
  @Input() vacancy!: WritableSignal<Vacancy | undefined>;
  @Output() sendResponse = new EventEmitter<void>();

  onSendResponseClick(): void {
    this.sendResponse.emit();
  }
}
