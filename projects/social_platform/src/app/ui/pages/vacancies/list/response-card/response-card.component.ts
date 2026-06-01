/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  input,
  Input,
  OnInit,
  output,
  Output,
} from "@angular/core";
import { VacancyResponse } from "@domain/vacancy/vacancy-response.model";
import { FileItemComponent } from "@ui/primitives/file-item/file-item.component";
import { IconComponent } from "@uilib";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AuthInfoService } from "@api/auth/facades/auth-info.service";

/** Карточка отклика на вакансию с информацией о кандидате и действиями. */
@Component({
  selector: "app-response-card",
  templateUrl: "./response-card.component.html",
  styleUrl: "./response-card.component.scss",
  imports: [IconComponent, FileItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponseCardComponent implements OnInit {
  private readonly authRepository = inject(AuthInfoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly response = input.required<VacancyResponse>();
  readonly reject = output<number>();
  readonly accept = output<number>();

  profileId!: number;

  ngOnInit(): void {
    this.authRepository
      .fetchProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: profile => {
          this.profileId = profile.id;
        },
      });
  }

  onAccept(responseId: number) {
    this.accept.emit(responseId);
  }

  onReject(responseId: number) {
    this.reject.emit(responseId);
  }
}
