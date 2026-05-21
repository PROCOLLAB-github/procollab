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
import { UserLinksPipe, TruncatePipe, CapitalizePipe, SalaryTransformPipe } from "@corelib";
import { RouterModule } from "@angular/router";
import { Vacancy } from "@domain/vacancy/vacancy.model";
import { ReactiveFormsModule } from "@angular/forms";
import { AppRoutes } from "@api/paths/app-routes";

/** Правая колонка детали вакансии. */
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
  protected readonly AppRoutes = AppRoutes;
  @Input() vacancy!: WritableSignal<Vacancy | undefined>;
  @Output() sendResponse = new EventEmitter<void>();

  onSendResponseClick(): void {
    this.sendResponse.emit();
  }
}
