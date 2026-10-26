/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { A11yModule } from "@angular/cdk/a11y";
import { Subject, takeUntil } from "rxjs";
import { ButtonDirective } from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import {
  PreviewSolutionRegistrationRemovalUseCase,
  ApplySolutionRegistrationRemovalUseCase,
} from "@api/solution/use-cases/solution-registration-removal.use-cases";
import { SolutionRegistrationRemovalPreview } from "@domain/solution/solution-contract.model";

@Component({
  selector: "app-solution-registration-removal",
  imports: [A11yModule, ButtonDirective, ModalComponent],
  styleUrl: "./solution-applications.component.scss",
  template: `<app-modal
    [open]="!!request()"
    labelledBy="solution-registration-removal-title"
    (openChange)="!$event && close()"
    ><section class="solution-dialog" cdkTrapFocus [cdkTrapFocusAutoCapture]="true">
      <h2 id="solution-registration-removal-title">Удалить участников из программы?</h2>
      @if (pending()) {
        <p role="status">Проверяем регистрации и связанные решения…</p>
      }
      @if (error()) {
        <p role="alert">{{ error() }}</p>
        <button appButton="secondary" type="button" [disabled]="busy()" (click)="load()">
          Обновить данные
        </button>
      }
      @if (preview(); as p) {
        <p>Будет удалено регистраций: {{ p.deletedCount }}. Аккаунты пользователей сохранятся.</p>
        <p>
          Заявок в архив: {{ p.archivedCount }}. Исключений из команды: {{ p.removedMemberCount }}.
          Назначений снимется: {{ p.removedAssignmentsCount }}. Приглашений будет отозвано:
          {{ p.revokedInvitationCount }}.
        </p>
        <p>
          Сданные материалы, прежний состав и оценки сохранятся в истории. Архивные решения
          перестанут участвовать в оценивании и публикации.
        </p>
        <ul>
          @for (registration of p.registrations; track registration.registrationId) {
            <li>{{ registration.user.firstName }} {{ registration.user.lastName }}</li>
          }
        </ul>
        <ul>
          @for (effect of p.effects; track effect.application.solutionId) {
            <li>
              {{ effect.application.name }}:
              {{
                effect.effect === "archive"
                  ? "архивировать заявку капитана"
                  : effect.effect === "remove_members"
                    ? "исключить участников"
                    : "отозвать приглашения"
              }}{{ effect.isSubmitted ? " · решение сдано" : "" }}. Сохраненных оценок:
              {{ effect.scoreCount }}.
            </li>
          }
        </ul>
        @for (issue of p.errors; track $index) {
          <p role="alert">{{ issue.detail }}</p>
        }
      }
      <footer>
        <button
          appButton="secondary"
          cdkFocusInitial
          type="button"
          [disabled]="busy()"
          (click)="close()"
        >
          Отмена</button
        ><button
          appButton="primary"
          type="button"
          [disabled]="busy() || pending() || !preview()?.canApply || !preview()?.previewToken"
          (click)="confirm()"
        >
          {{ busy() ? "Удаляем…" : "Удалить из программы" }}
        </button>
      </footer>
    </section></app-modal
  >`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolutionRegistrationRemovalComponent {
  readonly request = input<{ programId: number; ids: number[] } | null>(null);
  readonly closed = output<void>();
  readonly completed = output<number>();
  readonly busyChange = output<boolean>();
  readonly pending = signal(false);
  readonly busy = signal(false);
  readonly error = signal("");
  readonly preview = signal<SolutionRegistrationRemovalPreview | null>(null);
  private readonly getPreview = inject(PreviewSolutionRegistrationRemovalUseCase);
  private readonly apply = inject(ApplySolutionRegistrationRemovalUseCase);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cancel = new Subject<void>();
  constructor() {
    effect(() => {
      this.request();
      untracked(() => {
        this.cancel.next();
        this.preview.set(null);
        this.error.set("");
        this.pending.set(false);
        if (this.request()) this.load();
      });
    });
  }
  load(): void {
    const request = this.request();
    if (!request || this.busy()) return;
    this.cancel.next();
    this.preview.set(null);
    this.error.set("");
    this.pending.set(true);
    this.getPreview
      .execute(request.programId, { registrationIds: request.ids })
      .pipe(takeUntil(this.cancel), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.pending.set(false);
        if (result.ok) this.preview.set(result.value);
        else this.error.set(result.error.detail);
      });
  }
  confirm(): void {
    const request = this.request(),
      p = this.preview();
    if (!request || !p?.canApply || !p.previewToken || this.busy()) return;
    this.busy.set(true);
    this.busyChange.emit(true);
    this.error.set("");
    this.apply
      .execute(request.programId, { registrationIds: request.ids, previewToken: p.previewToken })
      .pipe(takeUntil(this.cancel), takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.busy.set(false);
        this.busyChange.emit(false);
        this.preview.set(null);
        if (result.ok) this.completed.emit(result.value.deletedCount);
        else this.error.set(result.error.detail);
      });
  }
  close(): void {
    if (this.busy()) return;
    this.cancel.next();
    this.closed.emit();
  }
}
