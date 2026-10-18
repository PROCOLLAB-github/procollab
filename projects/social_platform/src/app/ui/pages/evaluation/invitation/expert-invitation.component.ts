/** @format */
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Meta } from "@angular/platform-browser";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { AlertDirective, ButtonDirective, ChoiceDirective, FieldDirective } from "@uilib";
import { TokenService } from "@corelib";
import { EvaluationUseCase } from "@api/program/use-cases/evaluation.use-case";
import { LoginUseCase } from "@api/auth/use-cases/login.use-case";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { ExpertInvitation } from "@domain/program/evaluation-workspace.model";
import { evaluationError } from "@utils/evaluation-workspace";
import { AppRoutes } from "@api/paths/app-routes";
import { EventBus } from "@domain/shared/event-bus";
import { loggedOut } from "@domain/auth/events/logged-out.event";

@Component({
  selector: "app-expert-invitation",
  imports: [
    RouterLink,
    ReactiveFormsModule,
    AlertDirective,
    ButtonDirective,
    ChoiceDirective,
    FieldDirective,
  ],
  templateUrl: "./expert-invitation.component.html",
  styleUrl: "./expert-invitation.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpertInvitationComponent {
  private readonly api = inject(EvaluationUseCase);
  private readonly login = inject(LoginUseCase);
  private readonly events = inject(EventBus);
  private readonly tokens = inject(TokenService);
  private readonly profile = inject(ProfileInfoService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly meta = inject(Meta);
  readonly paths = AppRoutes;
  readonly invitation = signal<ExpertInvitation | null>(null);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly hasSession = signal(!!this.tokens.getTokens());
  readonly mode = signal<"intro" | "register" | "login" | "reset" | "sent" | "joined">("intro");
  readonly showPassword = signal(false);
  readonly password = this.fb.control("", Validators.required);
  readonly registration = this.fb.group({
    firstName: ["", [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)]],
    lastName: ["", [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)]],
    password: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
    repeatPassword: ["", Validators.required],
    acceptPolicy: [false, Validators.requiredTrue],
    acceptAge: [false, Validators.requiredTrue],
  });
  private token = "";
  private sequence = 0;
  constructor() {
    const previous = this.meta.getTag('name="referrer"')?.content;
    this.meta.updateTag({ name: "referrer", content: "no-referrer" });
    this.destroyRef.onDestroy(() => {
      if (previous !== undefined) this.meta.updateTag({ name: "referrer", content: previous });
      else this.meta.removeTag('name="referrer"');
    });
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(params => {
      this.token = params.get("token") ?? "";
      this.mode.set(this.route.snapshot.queryParamMap.get("mode") === "login" ? "login" : "intro");
      this.load();
    });
  }
  load(): void {
    const seq = ++this.sequence;
    this.loading.set(true);
    this.error.set(null);
    this.invitation.set(null);
    this.api
      .invitation(this.token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          if (seq !== this.sequence) return;
          this.invitation.set(data);
          this.hasSession.set(!!this.tokens.getTokens());
          this.loading.set(false);
        },
        error: e => {
          if (seq !== this.sequence) return;
          this.error.set(evaluationError(e));
          this.loading.set(false);
        },
      });
  }
  changeMode(mode: "intro" | "register" | "login" | "reset"): void {
    if (this.busy()) return;
    this.error.set(null);
    this.mode.set(mode);
    this.password.reset("");
  }
  switchAccount(): void {
    this.tokens.clearTokens();
    this.events.emit(loggedOut());
    this.profile.invalidateProfile();
    this.hasSession.set(false);
    this.mode.set("login");
    this.load();
  }
  signIn(): void {
    const invitation = this.invitation();
    if (!invitation || this.password.invalid || this.busy()) {
      this.password.markAsTouched();
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.login
      .execute({ email: invitation.loginEmail ?? invitation.email, password: this.password.value })
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(result => {
        if (!result.ok) {
          this.error.set("Не удалось войти. Проверьте пароль и повторите попытку.");
          return;
        }
        this.tokens.memTokens(result.value.tokens);
        this.profile.invalidateProfile();
        this.profile.ensureProfileLoaded();
        this.password.reset("");
        this.mode.set("intro");
        this.load();
      });
  }
  register(): void {
    if (this.busy()) return;
    this.registration.markAllAsTouched();
    const data = this.registration.getRawValue();
    if (this.registration.invalid) {
      this.error.set("Заполните обязательные поля и подтвердите согласия.");
      return;
    }
    if (data.password !== data.repeatPassword) {
      this.error.set("Пароли не совпадают.");
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    this.api
      .register(this.token, data)
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: result => {
          this.tokens.memTokens(result);
          this.registration.reset();
          this.hasSession.set(true);
          this.profile.invalidateProfile();
          this.profile.ensureProfileLoaded();
          this.mode.set("joined");
        },
        error: e => this.error.set(evaluationError(e)),
      });
  }
  accept(): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    this.api
      .accept(this.token)
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.profile.invalidateProfile();
          this.profile.ensureProfileLoaded();
          this.mode.set("joined");
        },
        error: e => this.error.set(evaluationError(e)),
      });
  }
  resetPassword(): void {
    const invitation = this.invitation();
    if (!invitation || this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    this.api
      .resetPassword(this.token, invitation.email)
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.mode.set("sent"),
        error: e => this.error.set(evaluationError(e)),
      });
  }
}
