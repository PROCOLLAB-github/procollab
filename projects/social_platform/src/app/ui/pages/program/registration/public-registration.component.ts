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
import { debounceTime, finalize, merge, Subscription } from "rxjs";
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
import { userErrorMessage } from "@core/lib/models/error/user-error-message";
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
  readonly formLoadError = signal<string | null>(null);
  readonly answerErrors = signal<Record<string, string>>({});
  readonly notice = signal<string | null>(null);
  readonly mode = signal<
    "form" | "login" | "reset" | "sent" | "checking" | "confirm" | "confirmed" | "expired" | "linkError"
  >("form");
  readonly canRetryConfirmation = signal(false);
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
  private id = -1;
  private seq = 0;
  private receipt = "";
  private answersSubscription?: Subscription;
  private answersKey = "";
  private confirmationRequest?: Subscription;
  private queuedLinkCheck = false;
  constructor() {
    const previous = this.meta.getTag('name="referrer"')?.content;
    this.meta.updateTag({ name: "referrer", content: "no-referrer" });
    this.destroy.onDestroy(() => {
      this.answersSubscription?.unsubscribe();
      if (previous !== undefined) this.meta.updateTag({ name: "referrer", content: previous });
      else this.meta.removeTag('name="referrer"');
    });
    merge(this.route.paramMap, this.route.fragment, this.route.queryParamMap)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.readRoute());
  }
  private readRoute() {
    const route = this.route.snapshot;
    const id = Number(route.paramMap.get("id"));
    const proof =
      new URLSearchParams(route.fragment ?? "").get("confirmation") ??
      route.queryParamMap.get("confirmation") ??
      "";
    if (this.id !== id) {
      this.queuedLinkCheck = false;
      this.confirmationRequest?.unsubscribe();
      this.answersSubscription?.unsubscribe();
      this.answersKey = "";
      this.answers = registrationControls([]);
      this.program.set(null);
      this.id = id;
      this.error.set(null);
      this.notice.set(null);
      this.confirmToken.set("");
      try {
        const saved = JSON.parse(sessionStorage.getItem(this.key("pending")) ?? "null");
        this.receipt = saved?.receipt ?? "";
        this.pendingEmail.set(saved?.email ?? "");
      } catch {
        this.receipt = "";
        this.pendingEmail.set("");
      }
      this.hasReceipt.set(!!this.receipt);
      this.mode.set(
        route.queryParamMap.get("mode") === "login" ? "login" : this.receipt ? "sent" : "form",
      );
      this.load();
    }
    if (proof === this.confirmToken()) return;
    this.queuedLinkCheck = false;
    this.confirmationRequest?.unsubscribe();
    this.confirmToken.set(proof);
    if (proof) this.checkConfirmation();
    else this.mode.set(this.receipt ? "sent" : "form");
  }
  private key(suffix: string) {
    return `program-registration-${this.id}-${suffix}`;
  }
  private browserProof() {
    try {
      const key = this.key("browser-proof");
      const saved = JSON.parse(localStorage.getItem(key) ?? "null");
      if (saved?.expiresAt > Date.now() && typeof saved.proof === "string") return saved.proof;
      localStorage.removeItem(key);
    } catch {
      /* Manual confirmation stays available. */
    }
    return "";
  }
  load() {
    const seq = ++this.seq;
    this.loading.set(true);
    this.formLoadError.set(null);
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
          const key = this.key(data.resume ? `answers-${data.resume.draftId}` : "answers");
          const current = this.answersKey === key ? this.answers.getRawValue() : {};
          let saved: Record<string, RegistrationValue> = {};
          try {
            saved = JSON.parse(sessionStorage.getItem(key) ?? "{}");
          } catch {
            /* Ignore corrupt local draft. */
          }
          this.answers = registrationControls(data.fields, {
            ...data.resume?.answers,
            ...saved,
            ...current,
          });
          this.answersSubscription?.unsubscribe();
          this.answersKey = key;
          const group = this.answers;
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
          if (seq === this.seq) this.formLoadError.set(evaluationError(e));
        },
      });
  }
  changeMode(mode: "form" | "login" | "reset") {
    this.error.set(null);
    this.notice.set(null);
    this.mode.set(mode);
    this.removeConfirmationLink();
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
    const id = this.id;
    this.api
      .submit(id, payload, !this.authenticated())
      .pipe(
        finalize(() => this.finishAction()),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe({
        next: result => {
          if (id !== this.id) return;
          if (result.enrolled) {
            this.openProgram();
            return;
          }
          this.receipt = result.receipt ?? "";
          this.hasReceipt.set(!!this.receipt);
          this.pendingEmail.set(result.email ?? account.email);
          if (result.browserProof) {
            try {
              localStorage.setItem(
                this.key("browser-proof"),
                JSON.stringify({ proof: result.browserProof, expiresAt: Date.now() + 7 * 86_400_000 }),
              );
            } catch {
              /* Manual confirmation stays available. */
            }
          }
          // The server now owns the submitted answers. A later login may be a different account.
          this.answersSubscription?.unsubscribe();
          this.answersKey = "";
          this.answers = registrationControls(data.fields);
          try {
            sessionStorage.removeItem(this.key("answers"));
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
          if (id !== this.id) return;
          this.error.set(evaluationError(e));
          const errors = e?.error?.answers;
          if (errors && typeof errors === "object") {
            this.answerErrors.set(
              Object.fromEntries(
                Object.entries(errors).map(([k, v]) => [
                  k,
                  userErrorMessage(v, "Проверьте ответ на этот вопрос."),
                ]),
              ),
            );
            this.error.set(
              "Проверьте поля анкеты: " +
                Object.keys(errors)
                  .map(
                    key => this.program()?.fields.find(f => f.id === key)?.label ?? "Поле анкеты",
                  )
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
        finalize(() => this.finishAction()),
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
  checkConfirmation() {
    if (this.busy()) {
      this.queuedLinkCheck = true;
      this.mode.set("checking");
      return;
    }
    // Do not replace a different active session just by opening a link.
    const browserProof = this.tokens.getTokens() ? "" : this.browserProof();
    this.requestConfirmation({ linkOpened: true, ...(browserProof ? { browserProof } : {}) });
  }
  confirm() {
    this.requestConfirmation();
  }
  private finishAction() {
    this.busy.set(false);
    if (this.queuedLinkCheck && !this.destroy.destroyed) {
      this.queuedLinkCheck = false;
      this.checkConfirmation();
    }
  }
  private requestConfirmation(openedLink?: { linkOpened: true; browserProof?: string }) {
    if (!this.confirmToken() || this.busy()) return;
    this.busy.set(true);
    this.mode.set("checking");
    this.error.set(null);
    this.notice.set(null);
    this.canRetryConfirmation.set(false);
    this.confirmationRequest = this.api
      .tokenAction(this.id, "confirm", this.confirmToken(), openedLink)
      .pipe(
        finalize(() => this.finishAction()),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe({
        next: result => {
          if (result.confirmationRequired) {
            this.mode.set("confirm");
            return;
          }
          if (!result.access || !result.refresh) {
            this.mode.set("linkError");
            this.canRetryConfirmation.set(true);
            this.error.set("Не удалось проверить ссылку. Попробуйте ещё раз.");
            return;
          }
          this.tokens.memTokens({ access: result.access, refresh: result.refresh });
          this.profile.invalidateProfile();
          this.authenticated.set(true);
          try {
            if (openedLink?.browserProof && this.browserProof() === openedLink.browserProof)
              localStorage.removeItem(this.key("browser-proof"));
          } catch {
            /* Optional storage. */
          }
          if (result.enrolled) {
            this.openProgram(true);
            return;
          }
          this.clearPending();
          this.removeConfirmationLink();
          this.mode.set("form");
          if (result.reviewRequired) {
            this.notice.set(
              "Почта подтверждена. Анкета обновлена — проверьте ответы и заполните новые обязательные поля.",
            );
          } else this.notice.set("Почта подтверждена. Регистрация в программу уже закрыта.");
          this.load();
        },
        error: e => {
          switch (e?.error?.code) {
            case "confirmation_used":
              this.mode.set("confirmed");
              return;
            case "confirmation_expired":
              this.mode.set("expired");
              return;
          }
          this.mode.set("linkError");
          if (e?.error?.code === "confirmation_replaced") {
            this.error.set("Эта ссылка заменена. Откройте последнее письмо о подтверждении.");
          } else if (e?.error?.code === "confirmation_invalid" || e?.status === 404) {
            this.error.set("Ссылка недействительна.");
          } else {
            this.canRetryConfirmation.set(true);
            this.error.set("Не удалось проверить ссылку. Попробуйте ещё раз.");
          }
        },
      });
  }
  private removeConfirmationLink() {
    if (!this.confirmToken()) return;
    this.queuedLinkCheck = false;
    this.confirmToken.set("");
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { confirmation: null },
      queryParamsHandling: "merge",
      replaceUrl: true,
    });
  }
  private clearPending() {
    this.receipt = "";
    this.hasReceipt.set(false);
    this.pendingEmail.set("");
    try {
      sessionStorage.removeItem(this.key("pending"));
    } catch {
      /* Optional storage. */
    }
  }
  resend() {
    if (this.busy()) return;
    const proof = this.confirmToken();
    const token = this.mode() === "expired" ? proof : this.receipt;
    if (!token) return;
    const id = this.id;
    this.busy.set(true);
    this.error.set(null);
    this.notice.set(null);
    this.api
      .tokenAction(id, "resend", token)
      .pipe(
        finalize(() => this.finishAction()),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe({
        next: result => {
          if (id !== this.id || proof !== this.confirmToken()) return;
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
          this.removeConfirmationLink();
          this.mode.set("sent");
          this.notice.set("Новое письмо отправлено. Проверьте входящие и папку «Спам».");
        },
        error: e => {
          if (id !== this.id || proof !== this.confirmToken()) return;
          if (e?.error?.code === "confirmation_used") {
            this.clearPending();
            this.mode.set("confirmed");
          } else this.error.set(evaluationError(e));
        },
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
        finalize(() => this.finishAction()),
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
  openProgram(replaceUrl = false) {
    this.clearPending();
    try {
      sessionStorage.removeItem(this.key("answers"));
      if (this.answersKey) sessionStorage.removeItem(this.answersKey);
    } catch {
      /* Optional storage. */
    }
    this.answers.markAsPristine();
    this.account.markAsPristine();
    this.profile.invalidateProfile();
    void this.router.navigateByUrl(`/office/program/${this.id}`, { replaceUrl });
  }
  @HostListener("window:beforeunload", ["$event"]) beforeUnload(event: BeforeUnloadEvent) {
    if (this.busy()) {
      event.preventDefault();
      event.returnValue = "";
    }
  }
}
