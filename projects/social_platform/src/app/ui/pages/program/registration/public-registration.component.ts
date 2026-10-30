/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  inject,
  signal,
} from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Meta } from "@angular/platform-browser";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { debounceTime, finalize, Subscription } from "rxjs";
import {
  AlertDirective,
  ButtonDirective,
  ChoiceDirective,
  FieldDirective,
  IconComponent,
} from "@uilib";
import { TokenService } from "@corelib";
import { ProgramRegistrationUseCase } from "@api/program/use-cases/program-registration.use-case";
import { ProgramRegistrationRepositoryPort } from "@domain/program/ports/program-registration.repository.port";
import { ProgramRegistrationHttpAdapter } from "@infrastructure/adapters/program/program-registration-http.adapter";
import { RegistrationPublic, RegistrationValue } from "@domain/program/program-registration.model";
import {
  registrationControls,
  RegistrationFieldsComponent,
} from "@ui/widgets/registration-fields/registration-fields.component";
import { LoginUseCase } from "@api/auth/use-cases/login.use-case";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { evaluationError } from "@utils/evaluation-workspace";
@Component({
  selector: "app-public-program-registration",
  imports: [
    RouterLink,
    ReactiveFormsModule,
    AlertDirective,
    ButtonDirective,
    ChoiceDirective,
    FieldDirective,
    IconComponent,
    RegistrationFieldsComponent,
  ],
  providers: [
    ProgramRegistrationUseCase,
    { provide: ProgramRegistrationRepositoryPort, useClass: ProgramRegistrationHttpAdapter },
  ],
  templateUrl: "./public-registration.component.html",
  styleUrl: "./public-registration.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicRegistrationComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ProgramRegistrationUseCase);
  private readonly login = inject(LoginUseCase);
  private readonly profile = inject(ProfileInfoService);
  private readonly tokens = inject(TokenService);
  private readonly destroy = inject(DestroyRef);
  private readonly meta = inject(Meta);
  private readonly fb = inject(FormBuilder).nonNullable;
  readonly program = signal<RegistrationPublic | null>(null);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly answerErrors = signal<Record<string, string>>({});
  readonly notice = signal<string | null>(null);
  readonly mode = signal<"form" | "login" | "reset" | "sent" | "confirm" | "expired">("form");
  readonly authenticated = signal(!!this.tokens.getTokens());
  readonly showPassword = signal(false);
  readonly showRepeat = signal(false);
  readonly confirmToken = signal("");
  readonly pendingEmail = signal("");
  readonly hasReceipt = signal(false);
  readonly account = this.fb.group({
    firstName: ["", Validators.required],
    lastName: ["", Validators.required],
    email: ["", [Validators.required, Validators.email]],
    birthday: ["", Validators.required],
    password: ["", [Validators.required, Validators.minLength(8)]],
    repeatPassword: ["", Validators.required],
    acceptPolicy: [false, Validators.requiredTrue],
    acceptAge: [false, Validators.requiredTrue],
  });
  readonly credentials = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", Validators.required],
  });
  answers = registrationControls([]);
  private id = 0;
  private seq = 0;
  private receipt = "";
  private answersSubscription?: Subscription;
  constructor() {
    const previous = this.meta.getTag('name="referrer"')?.content;
    this.meta.updateTag({ name: "referrer", content: "no-referrer" });
    this.destroy.onDestroy(() => {
      this.answersSubscription?.unsubscribe();
      if (previous !== undefined) this.meta.updateTag({ name: "referrer", content: previous });
      else this.meta.removeTag('name="referrer"');
    });
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(params => {
      this.answersSubscription?.unsubscribe();
      this.answers = registrationControls([]);
      this.program.set(null);
      this.id = Number(params.get("id"));
      this.error.set(null);
      this.notice.set(null);
      const confirmation =
        new URLSearchParams(this.route.snapshot.fragment ?? "").get("confirmation") ??
        this.route.snapshot.queryParamMap.get("confirmation");
      this.confirmToken.set(confirmation ?? "");
      try {
        const saved = JSON.parse(sessionStorage.getItem(this.key("pending")) ?? "null");
        this.receipt = saved?.receipt ?? "";
        this.pendingEmail.set(saved?.email ?? "");
      } catch {
        this.receipt = "";
      }
      this.hasReceipt.set(!!this.receipt);
      this.mode.set(
        confirmation
          ? "confirm"
          : this.route.snapshot.queryParamMap.get("mode") === "login"
            ? "login"
            : this.receipt
              ? "sent"
              : "form",
      );
      this.load();
    });
    this.route.fragment.pipe(takeUntilDestroyed()).subscribe(fragment => {
      const proof = new URLSearchParams(fragment ?? "").get("confirmation");
      if (proof) {
        this.confirmToken.set(proof);
        this.error.set(null);
        this.mode.set("confirm");
      }
    });
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe(query => {
      const proof = query.get("confirmation");
      if (proof) {
        this.confirmToken.set(proof);
        this.error.set(null);
        this.mode.set("confirm");
      }
    });
  }
  private key(suffix: string) {
    return `program-registration-${this.id}-${suffix}`;
  }
  load() {
    const seq = ++this.seq;
    this.loading.set(true);
    this.error.set(null);
    this.api
      .publicForm(this.id)
      .pipe(
        finalize(() => {
          if (seq === this.seq) this.loading.set(false);
        }),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe({
        next: data => {
          if (seq !== this.seq) return;
          const current = this.answers.getRawValue();
          let saved: Record<string, RegistrationValue> = {};
          try {
            saved = JSON.parse(sessionStorage.getItem(this.key("answers")) ?? "{}");
          } catch {
            /* Ignore corrupt local draft. */
          }
          this.answers = registrationControls(data.fields, { ...saved, ...current });
          this.answersSubscription?.unsubscribe();
          const group = this.answers,
            key = this.key("answers");
          this.answersSubscription = group.valueChanges
            .pipe(debounceTime(150), takeUntilDestroyed(this.destroy))
            .subscribe(() => {
              try {
                sessionStorage.setItem(key, JSON.stringify(group.getRawValue()));
              } catch {
                /* Submission remains available without browser storage. */
              }
            });
          this.program.set(data);
          this.authenticated.set(data.authenticated);
        },
        error: e => {
          if (seq === this.seq) this.error.set(evaluationError(e));
        },
      });
  }
  changeMode(mode: "form" | "login" | "reset") {
    this.error.set(null);
    this.notice.set(null);
    this.mode.set(mode);
    if (this.account.controls.email.value)
      this.credentials.controls.email.setValue(this.account.controls.email.value);
    this.credentials.controls.password.reset("");
  }
  submit() {
    const data = this.program();
    if (!data || this.busy() || data.closed) return;
    this.answers.markAllAsTouched();
    if (!this.authenticated()) this.account.markAllAsTouched();
    if (this.answers.invalid || (!this.authenticated() && this.account.invalid)) {
      this.error.set(
        this.authenticated()
          ? "Заполните обязательные поля анкеты."
          : "Заполните обязательные поля и подтвердите согласия.",
      );
      return;
    }
    const account = this.account.getRawValue();
    if (!this.authenticated() && account.password !== account.repeatPassword) {
      this.error.set("Пароли не совпадают.");
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.answerErrors.set({});
    const payload = {
      version: data.version,
      answers: this.answers.getRawValue(),
      ...(!this.authenticated() ? account : {}),
    };
    this.api
      .submit(this.id, payload, !this.authenticated())
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe({
        next: result => {
          if (result.enrolled) {
            this.openProgram();
            return;
          }
          this.receipt = result.receipt ?? "";
          this.hasReceipt.set(!!this.receipt);
          this.pendingEmail.set(result.email ?? account.email);
          try {
            sessionStorage.setItem(
              this.key("pending"),
              JSON.stringify({ receipt: this.receipt, email: this.pendingEmail() }),
            );
          } catch {
            /* The confirmation link also supports resend. */
          }
          this.account.controls.password.reset("");
          this.account.controls.repeatPassword.reset("");
          this.mode.set("sent");
        },
        error: e => {
          this.error.set(evaluationError(e));
          const errors = e?.error?.answers;
          if (errors && typeof errors === "object") {
            this.answerErrors.set(
              Object.fromEntries(
                Object.entries(errors).map(([k, v]) => [
                  k,
                  Array.isArray(v) ? v.join(" ") : String(v),
                ]),
              ),
            );
            this.error.set(
              "Проверьте поля анкеты: " +
                Object.keys(errors)
                  .map(key => this.program()?.fields.find(f => f.id === key)?.label ?? key)
                  .join(", ") +
                ".",
            );
          }
          if (e?.error?.code === "form_changed") {
            this.load();
            this.notice.set(
              "Анкета обновлена. Сохраненные ответы перенесены; проверьте поля перед отправкой.",
            );
          }
          if (e?.error?.code === "account_exists") {
            this.credentials.controls.email.setValue(account.email);
            this.mode.set("login");
          }
          if (e?.error?.code === "registration_closed") this.load();
        },
      });
  }
  signIn() {
    this.credentials.markAllAsTouched();
    if (this.credentials.invalid || this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    this.login
      .execute(this.credentials.getRawValue())
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe({
        next: result => {
          if (!result.ok) {
            this.error.set(
              "Не удалось войти. Проверьте почту и пароль. Если почта еще не подтверждена, перейдите по ссылке из письма.",
            );
            return;
          }
          this.tokens.memTokens(result.value.tokens);
          this.profile.invalidateProfile();
          this.authenticated.set(true);
          this.credentials.controls.password.reset("");
          this.mode.set("form");
          this.load();
        },
        error: () => this.error.set("Не удалось войти. Попробуйте еще раз."),
      });
  }
  confirm() {
    if (!this.confirmToken() || this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    this.api
      .tokenAction(this.id, "confirm", this.confirmToken())
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe({
        next: result => {
          if (result.access && result.refresh) {
            this.tokens.memTokens({ access: result.access, refresh: result.refresh });
            this.profile.invalidateProfile();
            this.authenticated.set(true);
          }
          void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true,
          });
          if (result.enrolled) this.openProgram();
          else {
            this.mode.set("form");
            if (result.reviewRequired) {
              this.answers.patchValue(result.answers ?? {});
              try {
                sessionStorage.setItem(this.key("answers"), JSON.stringify(result.answers ?? {}));
              } catch {
                /* Optional storage. */
              }
              this.notice.set(
                "Почта подтверждена. Анкета обновлена — проверьте ответы и заполните новые обязательные поля.",
              );
            } else this.notice.set("Почта подтверждена. Регистрация в программу уже закрыта.");
            this.load();
          }
        },
        error: e => {
          this.error.set(evaluationError(e));
          this.mode.set("expired");
        },
      });
  }
  resend() {
    if (this.busy()) return;
    const token = this.receipt || this.confirmToken();
    if (!token) return;
    this.busy.set(true);
    this.error.set(null);
    this.notice.set(null);
    this.api
      .tokenAction(this.id, "resend", token)
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe({
        next: result => {
          this.receipt = result.receipt ?? this.receipt;
          this.hasReceipt.set(!!this.receipt);
          try {
            sessionStorage.setItem(
              this.key("pending"),
              JSON.stringify({ receipt: this.receipt, email: this.pendingEmail() }),
            );
          } catch {
            /* Optional storage. */
          }
          this.mode.set("sent");
          this.notice.set("Новое письмо отправлено. Проверьте входящие и папку «Спам».");
        },
        error: e => this.error.set(evaluationError(e)),
      });
  }
  resetPassword() {
    this.credentials.controls.email.markAsTouched();
    if (this.credentials.controls.email.invalid || this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    this.api
      .resetPassword(this.id, this.credentials.controls.email.value)
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe({
        next: () =>
          this.notice.set(
            "Если аккаунт существует, на почту отправлено письмо. После смены пароля вы вернетесь к этой программе.",
          ),
        error: e => this.error.set(evaluationError(e)),
      });
  }
  openProgram() {
    try {
      sessionStorage.removeItem(this.key("answers"));
      sessionStorage.removeItem(this.key("pending"));
    } catch {
      /* Optional storage. */
    }
    this.answers.markAsPristine();
    this.account.markAsPristine();
    this.profile.invalidateProfile();
    void this.router.navigateByUrl(`/office/program/${this.id}`);
  }
  @HostListener("window:beforeunload", ["$event"]) beforeUnload(event: BeforeUnloadEvent) {
    if (this.busy()) {
      event.preventDefault();
      event.returnValue = "";
    }
  }
}
