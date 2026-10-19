/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Observable, catchError, exhaustMap, filter, finalize, map, of, timer } from "rxjs";
import {
  AlertDirective,
  AvatarComponent,
  ButtonDirective,
  ChoiceDirective,
  FieldDirective,
} from "@uilib";
import { ProgramOrganizersUseCase } from "@api/program/use-cases/program-organizers.use-case";
import {
  OrganizerAccessRemoved,
  OrganizerRow,
  ProgramOrganizers,
} from "@domain/program/program-organizers.model";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { evaluationError } from "@utils/evaluation-workspace";
import { presentationHref } from "@utils/program-case-analytics";

@Component({
  selector: "app-management-organizers",
  imports: [
    ReactiveFormsModule,
    AlertDirective,
    AvatarComponent,
    ButtonDirective,
    ChoiceDirective,
    FieldDirective,
    ModalComponent,
  ],
  templateUrl: "./organizers.component.html",
  styleUrl: "./organizers.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagementOrganizersComponent {
  readonly programId = input.required<number>();
  readonly confirmDiscard = input<() => Promise<boolean>>(() => Promise.resolve(true));
  readonly statusChange = output<{ dirty: boolean; busy: boolean }>();
  readonly accessRemoved = output<void>();
  private readonly api = inject(ProgramOrganizersUseCase);
  private readonly destroyRef = inject(DestroyRef);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly fb = inject(FormBuilder).nonNullable;
  readonly snapshot = signal<ProgramOrganizers | null>(null);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly dialogError = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly modal = signal<"invite" | "remove" | "revoke" | null>(null);
  readonly search = this.fb.control("");
  readonly status = this.fb.control("all");
  readonly email = this.fb.control("", [
    Validators.required,
    Validators.email,
    Validators.maxLength(254),
  ]);
  private readonly query = signal("");
  private readonly statusValue = signal("all");
  readonly page = signal(0);
  readonly pageSize = 25;
  readonly selectedId = signal<string | null>(null);
  readonly selected = computed(
    () => this.snapshot()?.organizers.find(r => r.id === this.selectedId()) ?? null,
  );
  readonly filtered = computed(() =>
    (this.snapshot()?.organizers ?? []).filter(
      r =>
        (this.statusValue() === "all" || r.status === this.statusValue()) &&
        `${r.name ?? ""} ${r.email}`
          .toLocaleLowerCase("ru")
          .includes(this.query().trim().toLocaleLowerCase("ru")),
    ),
  );
  readonly visible = computed(() =>
    this.filtered().slice(this.page() * this.pageSize, (this.page() + 1) * this.pageSize),
  );
  readonly dirty = signal(false);
  readonly floatingCenter = signal<number | null>(null);
  readonly floatingWidth = signal<number | null>(null);
  readonly deliveryRefreshPaused = signal(false);
  readonly href = presentationHref;
  initials(row: OrganizerRow): string {
    return (
      row.name
        ?.split(/\s+/)
        .filter(Boolean)
        .map(p => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "@"
    );
  }
  organizerCountLabel(): string {
    const n = this.snapshot()?.organizerCount ?? 0;
    return n % 10 === 1 && n % 100 !== 11
      ? "организатор"
      : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)
        ? "организатора"
        : "организаторов";
  }
  private sequence = 0;
  private queuedSince: number | null = null;
  private trigger: HTMLElement | null = null;
  readonly dialogTitle = computed(() =>
    this.modal() === "invite"
      ? "Пригласить организатора"
      : this.modal() === "revoke"
        ? "Отозвать приглашение?"
        : this.selected()?.isSelf
          ? "Выйти из организаторов?"
          : "Убрать доступ к программе?",
  );
  constructor() {
    for (const [control, set] of [
      [this.search, this.query],
      [this.status, this.statusValue],
    ] as const)
      control.valueChanges.pipe(takeUntilDestroyed()).subscribe(value => {
        set.set(value);
        this.page.set(0);
        this.clearSelection();
      });
    this.email.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.dirty.set(this.email.dirty && !!this.email.value.trim());
      this.dialogError.set(null);
    });
    effect(() => this.statusChange.emit({ dirty: this.dirty(), busy: this.busy() }));
    effect(() => {
      const id = this.programId();
      untracked(() => {
        this.snapshot.set(null);
        this.clearSelection();
        this.discard();
        this.load(id);
      });
    });
    timer(5000, 5000)
      .pipe(
        filter(
          i =>
            !this.busy() &&
            !!this.snapshot() &&
            (this.hasQueued() ? this.allowDeliveryRefresh() : i % 6 === 5),
        ),
        exhaustMap(() => {
          const id = this.programId();
          const seq = this.sequence;
          return this.api.list(id).pipe(
            map(data => ({ data, id, seq })),
            catchError(e => {
              if (id === this.programId() && seq === this.sequence) this.handleAccessError(e);
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe(result => {
        if (
          result &&
          result.id === this.programId() &&
          result.seq === this.sequence &&
          !this.busy()
        )
          this.apply(result.data);
      });
    afterNextRender(() => {
      const update = () => {
        const r = this.element.nativeElement.getBoundingClientRect();
        if (r.width > 0) {
          this.floatingCenter.set(r.left + r.width / 2);
          this.floatingWidth.set(
            Math.min(
              823,
              window.innerWidth < 1000 ? r.width : r.width - 40,
              window.innerWidth - 40,
            ),
          );
        }
      };
      const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
      observer?.observe(this.element.nativeElement);
      window.addEventListener("resize", update);
      update();
      this.destroyRef.onDestroy(() => {
        observer?.disconnect();
        window.removeEventListener("resize", update);
      });
    });
  }
  private hasQueued(): boolean {
    return !!this.snapshot()?.organizers.some(
      r => r.status === "pending" && r.deliveryStatus === "queued",
    );
  }
  private allowDeliveryRefresh(): boolean {
    const allowed = this.queuedSince !== null && Date.now() - this.queuedSince < 120000;
    if (!allowed) this.deliveryRefreshPaused.set(true);
    return allowed;
  }
  private apply(data: ProgramOrganizers): void {
    this.snapshot.set(data);
    this.page.set(
      Math.min(this.page(), Math.max(0, Math.ceil(this.filtered().length / this.pageSize) - 1)),
    );
    if (!this.selected()) {
      this.selectedId.set(null);
      if (this.modal() !== "invite") this.modal.set(null);
    }
    if (this.hasQueued()) {
      this.queuedSince ??= Date.now();
    } else {
      this.queuedSince = null;
      this.deliveryRefreshPaused.set(false);
    }
  }
  @HostListener("window:focus") refreshOnFocus(): void {
    if (!this.busy()) this.load();
  }
  load(id = this.programId()): void {
    const seq = ++this.sequence;
    this.loading.set(true);
    this.error.set(null);
    this.api
      .list(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          if (seq !== this.sequence || id !== this.programId()) return;
          this.apply(data);
          this.loading.set(false);
        },
        error: e => {
          if (seq !== this.sequence) return;
          this.loading.set(false);
          if (!this.handleAccessError(e)) this.error.set(evaluationError(e));
        },
      });
  }
  private handleAccessError(error: unknown): boolean {
    if (error instanceof HttpErrorResponse && (error.status === 403 || error.status === 401)) {
      this.snapshot.set(null);
      ++this.sequence;
      this.clearSelection();
      this.discard();
      this.busy.set(false);
      this.statusChange.emit({ dirty: false, busy: false });
      this.accessRemoved.emit();
      return true;
    }
    return false;
  }
  select(row: OrganizerRow): void {
    if (this.busy()) return;
    this.selectedId.set(this.selectedId() === row.id ? null : row.id);
  }
  clearSelection(): void {
    this.selectedId.set(null);
  }
  label(row: OrganizerRow): string {
    if (row.status === "joined") return row.active === false ? "Аккаунт отключен" : "Организатор";
    if (row.status === "expired") return "Ссылка истекла";
    return row.deliveryStatus === "failed"
      ? "Не отправлено"
      : row.deliveryStatus === "queued"
        ? "Ожидает отправки"
        : "Приглашен";
  }
  open(mode: "invite" | "remove" | "revoke", event?: Event): void {
    if (this.busy()) return;
    this.trigger = (event?.currentTarget as HTMLElement) ?? (document.activeElement as HTMLElement);
    this.dialogError.set(null);
    this.email.reset("");
    this.dirty.set(false);
    this.modal.set(mode);
  }
  async close(): Promise<void> {
    if (this.busy()) return;
    if (this.dirty() && !(await this.confirmDiscard()())) return;
    this.discard();
    this.trigger?.focus();
  }
  discard(): void {
    this.modal.set(null);
    this.email.reset("");
    this.dirty.set(false);
    this.dialogError.set(null);
  }
  invite(): void {
    this.email.markAsTouched();
    if (this.email.invalid || !this.snapshot() || this.busy()) return;
    this.mutate(
      this.api.invite(this.programId(), this.email.value.trim(), this.snapshot()!.revision),
      "Приглашение создано. Статус отправки появится в списке.",
    );
  }
  invitationAction(action: "resend" | "revoke"): void {
    const row = this.selected(),
      data = this.snapshot();
    if (!row?.invitationId || !data || this.busy()) return;
    this.mutate(
      this.api.invitationAction(this.programId(), row.invitationId, action, data.revision),
      action === "resend" ? "Приглашение отправляется повторно." : "Приглашение отозвано.",
    );
  }
  remove(): void {
    const row = this.selected(),
      data = this.snapshot();
    if (!row?.userId || !row.canRemove || !data || this.busy()) return;
    this.mutate(
      this.api.remove(this.programId(), row.userId, data.revision),
      "Доступ к управлению программой снят.",
    );
  }
  private mutate(
    request: Observable<ProgramOrganizers | OrganizerAccessRemoved>,
    message: string,
  ): void {
    this.busy.set(true);
    this.loading.set(false);
    this.dialogError.set(null);
    this.error.set(null);
    ++this.sequence;
    request
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: data => {
          this.discard();
          if ("accessRemoved" in data) {
            this.snapshot.set(null);
            this.clearSelection();
            this.busy.set(false);
            this.statusChange.emit({ dirty: false, busy: false });
            this.accessRemoved.emit();
            return;
          }
          this.apply(data);
          this.message.set(message);
          this.trigger?.focus();
        },
        error: e => {
          if (this.handleAccessError(e)) return;
          const text = evaluationError(e);
          if (this.modal()) this.dialogError.set(text);
          else this.error.set(text);
          if (e instanceof HttpErrorResponse && e.status === 409) this.load();
        },
      });
  }
}
