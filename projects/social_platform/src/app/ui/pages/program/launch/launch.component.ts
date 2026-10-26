/** @format */
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  defer,
  EMPTY,
  finalize,
  switchMap,
} from "rxjs";
import { AlertDirective, ButtonDirective, FieldDirective, IconComponent } from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { TransientNoticeComponent } from "@ui/primitives/transient-notice/transient-notice.component";
import { ProgramLaunchUseCase } from "@api/program/use-cases/program-launch.use-case";
import { ProgramLaunch } from "@domain/program/program-launch.model";
import { AppRoutes } from "@api/paths/app-routes";
import { evaluationError } from "@utils/evaluation-workspace";

@Component({
  selector: "app-program-launch",
  imports: [
    RouterLink,
    AlertDirective,
    ButtonDirective,
    FieldDirective,
    IconComponent,
    ModalComponent,
    TransientNoticeComponent,
  ],
  templateUrl: "./launch.component.html",
  styleUrl: "./launch.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramLaunchComponent {
  private readonly api = inject(ProgramLaunchUseCase);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  private readonly refresh = new BehaviorSubject(0);
  private contextId = 0;
  private trigger: HTMLElement | null = null;
  readonly paths = AppRoutes;
  readonly state = signal<ProgramLaunch | null>(null);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly publishError = signal<string | null>(null);
  readonly message = signal<string | null>(null, { equal: () => false });
  readonly confirmOpen = signal(false);
  readonly tabs = [
    { id: "participants", label: "Участники" },
    { id: "projects", label: "Проекты" },
    { id: "experts", label: "Эксперты" },
    { id: "results", label: "Результаты" },
    { id: "analytics", label: "Аналитика" },
    { id: "settings", label: "Настройки" },
    { id: "certificates", label: "Сертификаты" },
  ];
  constructor() {
    combineLatest([this.route.paramMap, this.refresh])
      .pipe(
        switchMap(([params]) =>
          defer(() => {
            this.contextId = Number(params.get("programId"));
            this.state.set(null);
            this.loading.set(true);
            this.error.set(null);
            this.confirmOpen.set(false);
            return this.api.readiness(this.contextId).pipe(
              catchError(e => {
                this.error.set(evaluationError(e));
                return EMPTY;
              }),
              finalize(() => this.loading.set(false)),
            );
          }),
        ),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe(state => this.state.set(state));
    if (this.route.snapshot.queryParamMap.has("previewError"))
      this.publishError.set(
        "Предпросмотр недоступен. Проверьте доступ к программе и обновите данные.",
      );
  }
  reload() {
    if (!this.busy()) this.refresh.next(this.refresh.value + 1);
  }
  firstMissing(code: string): boolean {
    return this.state()?.checks.find(c => !c.ready)?.code === code;
  }
  confirm(event: Event) {
    if (!this.state()?.canPublish || this.busy()) return;
    this.trigger = event.currentTarget as HTMLElement;
    this.publishError.set(null);
    this.confirmOpen.set(true);
  }
  closeConfirm() {
    if (this.busy()) return;
    this.confirmOpen.set(false);
    this.trigger?.focus();
  }
  publish() {
    const state = this.state();
    if (!state?.canPublish || this.busy()) return;
    const id = state.program.id;
    this.busy.set(true);
    this.publishError.set(null);
    this.api
      .publish(id, state.revision)
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe({
        next: value => {
          if (this.contextId !== id) return;
          this.state.set(value);
          this.confirmOpen.set(false);
        },
        error: e => {
          if (this.contextId !== id) return;
          this.publishError.set(evaluationError(e));
          this.confirmOpen.set(false);
          // GET recovery also handles a successful publication whose response was lost.
          this.refresh.next(this.refresh.value + 1);
        },
      });
  }
  async copy(link: string | null) {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      this.message.set("Ссылка скопирована.");
    } catch {
      this.publishError.set("Не удалось скопировать. Выделите ссылку и скопируйте вручную.");
    }
  }
  canDeactivate(): boolean {
    return !this.busy();
  }
}
