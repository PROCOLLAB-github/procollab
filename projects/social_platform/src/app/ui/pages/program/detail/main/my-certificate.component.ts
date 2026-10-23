/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  untracked,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ButtonDirective } from "@uilib";
import { ProgramCertificatesUseCase } from "@api/program/use-cases/program-certificates.use-case";
import { ProgramCertificatesRepositoryPort } from "@domain/program/ports/program-certificates.repository.port";
import { ProgramCertificatesHttpAdapter } from "@infrastructure/adapters/program/program-certificates-http.adapter";
@Component({
  selector: "app-my-certificate",
  imports: [ButtonDirective],
  providers: [
    ProgramCertificatesUseCase,
    { provide: ProgramCertificatesRepositoryPort, useClass: ProgramCertificatesHttpAdapter },
  ],
  template: `
    @if (url()) {
      <section class="my-certificate">
        <div>
          <h3>Ваш сертификат готов</h3>
          <p>Спасибо за участие в программе!</p>
        </div>
        <a appButton="primary" [href]="url()" rel="noreferrer">Скачать PDF</a>
      </section>
    } @else if (error()) {
      <section class="my-certificate">
        <p>Не удалось проверить сертификат.</p>
        <button type="button" appButton="secondary" (click)="load()">Повторить</button>
      </section>
    }
  `,
  styles: `
    @use "styles/ui-foundation";
    @use "styles/program-management-controls";
    :host {
      display: block;
    }
    .ui-button.ui-button {
      @include ui-foundation.button;
      @include program-management-controls.compact-action;
    }
    .my-certificate {
      display: flex;
      gap: 16px;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      background: var(--accent-light);
      border-radius: 12px;
      margin-bottom: 20px;
      font-size: 12px;
    }
    h3 {
      margin: 0;
      font-size: 14px;
    }
    p {
      margin: 6px 0 0;
    }
    @media (width <= 600px) {
      .my-certificate {
        flex-wrap: wrap;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyCertificateComponent {
  readonly programId = input.required<number>();
  private readonly api = inject(ProgramCertificatesUseCase);
  private readonly destroy = inject(DestroyRef);
  readonly url = signal<string | null>(null);
  readonly error = signal(false);
  private sequence = 0;
  constructor() {
    effect(() => {
      this.programId();
      untracked(() => this.load());
    });
  }
  load(): void {
    const sequence = ++this.sequence;
    this.error.set(false);
    this.url.set(null);
    this.api
      .mine(this.programId())
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: rows => {
          if (sequence === this.sequence) this.url.set(rows[0]?.url ?? null);
        },
        error: () => {
          if (sequence === this.sequence) this.error.set(true);
        },
      });
  }
}
