/** @format */
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ButtonDirective, IconComponent, AlertDirective } from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { ProgramRegistrationUseCase } from "@api/program/use-cases/program-registration.use-case";
import { ProgramRegistrationRepositoryPort } from "@domain/program/ports/program-registration.repository.port";
import { ProgramRegistrationHttpAdapter } from "@infrastructure/adapters/program/program-registration-http.adapter";
import { RegistrationSchema } from "@domain/program/program-registration.model";
import { registrationControls } from "@ui/widgets/registration-fields/registration-fields.component";
import { RegistrationPreviewContentComponent } from "@ui/widgets/registration-fields/registration-preview-content.component";
import { AppRoutes } from "@api/paths/app-routes";
import { evaluationError } from "@utils/evaluation-workspace";

@Component({
  selector: "app-program-preview-toolbar",
  imports: [
    RouterLink,
    ButtonDirective,
    IconComponent,
    AlertDirective,
    ModalComponent,
    RegistrationPreviewContentComponent,
  ],
  providers: [
    ProgramRegistrationUseCase,
    { provide: ProgramRegistrationRepositoryPort, useClass: ProgramRegistrationHttpAdapter },
  ],
  template: `@if (program(); as program) {
    <section class="preview-toolbar">
      <p>Предпросмотр программы · зарегистрированный участник</p>
      <div>
        <a appButton="secondary" [routerLink]="paths.program.launch(program.id)"
          >К подготовке программы</a
        ><button
          appButton="secondary"
          [disabled]="loading()"
          [appButtonLoading]="loading()"
          (click)="preview($event)"
        >
          Предпросмотр анкеты
        </button>
      </div>
      <p>Действия участника в предпросмотре недоступны.</p>
      @if (error()) {
        <p appAlert="error" role="alert">{{ error() }}</p>
      }
    </section>
    <app-modal
      bodyClass="program-registration-preview"
      [open]="open()"
      [labelledBy]="'launch-preview-title'"
      (openChange)="!$event && close()"
    >
      <section class="preview-dialog">
        <header>
          <h2 id="launch-preview-title">Предпросмотр анкеты</h2>
          <button appButton="text" aria-label="Закрыть" (click)="close()">
            <i appIcon icon="cross" appSquare="24"></i>
          </button>
        </header>
        @if (schema(); as schema) {
          <div class="preview-dialog__scroll">
            <app-registration-preview-content [fields]="schema.fields" [group]="group" />
          </div>
        }
        <footer><button appButton="secondary" (click)="close()">Закрыть</button></footer>
      </section>
    </app-modal>
  }`,
  styleUrl: "./preview-toolbar.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramPreviewToolbarComponent {
  readonly program = inject(ProgramDetailMainUIInfoService).program;
  readonly paths = AppRoutes;
  private readonly api = inject(ProgramRegistrationUseCase);
  private readonly destroy = inject(DestroyRef);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly open = signal(false);
  readonly schema = signal<RegistrationSchema | null>(null);
  group = registrationControls([]);
  private trigger: HTMLElement | null = null;
  preview(event: Event) {
    const id = this.program()?.id;
    if (!id || this.loading()) return;
    this.trigger = event.currentTarget as HTMLElement;
    this.loading.set(true);
    this.error.set(null);
    this.api
      .settings(id)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe({
        next: data => {
          if (id !== this.program()?.id) return;
          if (data.draft.mode === "external") {
            this.error.set(
              "Предпросмотр встроенной анкеты доступен для регистрации через PROCOLLAB.",
            );
            return;
          }
          this.schema.set(data.draft);
          this.group = registrationControls(data.draft.fields);
          this.group.disable();
          this.open.set(true);
        },
        error: e => {
          if (id === this.program()?.id) this.error.set(evaluationError(e));
        },
      });
  }
  close() {
    this.open.set(false);
    this.trigger?.focus();
  }
}
