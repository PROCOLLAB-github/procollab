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
import { IconComponent } from "@uilib";
import { ProgramCertificatesUseCase } from "@api/program/use-cases/program-certificates.use-case";
import { ProgramCertificatesRepositoryPort } from "@domain/program/ports/program-certificates.repository.port";
import { ProgramCertificatesHttpAdapter } from "@infrastructure/adapters/program/program-certificates-http.adapter";
@Component({
  selector: "app-my-certificate",
  imports: [IconComponent],
  host: { class: "my-certificate-widget" },
  // Нативная ссылка использует тот же stylesheet, что и канонический app-button.
  styleUrls: [
    "../../../../../../../../ui/src/lib/components/primitives/button/button.component.scss",
  ],
  providers: [
    ProgramCertificatesUseCase,
    { provide: ProgramCertificatesRepositoryPort, useClass: ProgramCertificatesHttpAdapter },
  ],
  template: `
    @if (url() || error()) {
      <section class="my-certificate">
        <header class="my-certificate__head">
          <h3 class="my-certificate__title text-body-12">
            {{ url() ? "Ваш сертификат готов" : "Сертификат" }}
          </h3>
          <i appIcon icon="file" appSquare="12" class="my-certificate__icon" aria-hidden="true"></i>
        </header>
        <div class="my-certificate__body">
          @if (url()) {
            <p class="my-certificate__text text-body-10">Спасибо за участие в программе!</p>
            <span class="my-certificate__action">
              <a
                class="button button--medium button--primary button--outline text-body-12"
                [href]="url()"
                rel="noreferrer"
                ><span class="button__content">Скачать PDF</span></a
              >
            </span>
          } @else {
            <p class="my-certificate__text text-body-10">Не удалось проверить сертификат.</p>
            <span class="my-certificate__action">
              <button
                type="button"
                class="button button--medium button--primary button--outline text-body-12"
                (click)="load()"
              >
                <span class="button__content">Повторить</span>
              </button>
            </span>
          }
        </div>
      </section>
    }
  `,
  styles: `
    :host(.my-certificate-widget) {
      display: block;
    }
    .my-certificate {
      padding: 24px;
      margin-bottom: 20px;
      background: var(--light-white);
      border-radius: var(--rounded-lg);

      &__head {
        display: flex;
        gap: 12px;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        border-bottom: 0.5px solid var(--accent);
      }

      &__title {
        margin: 0 0 8px;
        font-size: 12px;
        font-weight: 400;
        line-height: 130%;
        color: var(--accent);
      }

      &__icon {
        flex-shrink: 0;
        color: var(--accent);
      }

      &__body {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 12px;
        align-items: center;
        justify-content: space-between;
      }

      & &__text {
        flex: 1 1 160px;
        min-width: 0;
        margin: 0;
        color: var(--black);
      }

      &__action {
        display: inline-block;
        flex-shrink: 0;
        min-width: 0;
        max-width: 100%;
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
