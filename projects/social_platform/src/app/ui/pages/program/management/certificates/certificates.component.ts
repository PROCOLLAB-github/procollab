/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Observable, Subject, debounceTime, firstValueFrom, interval } from "rxjs";
import { saveAs } from "file-saver";
import { AlertDirective, ButtonDirective, ChoiceDirective, FieldDirective } from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { TransientNoticeComponent } from "@ui/primitives/transient-notice/transient-notice.component";
import { ProgramCertificatesUseCase } from "@api/program/use-cases/program-certificates.use-case";
import { ProgramCertificatesRepositoryPort } from "@domain/program/ports/program-certificates.repository.port";
import { ProgramCertificatesHttpAdapter } from "@infrastructure/adapters/program/program-certificates-http.adapter";
import {
  CertificateAsset,
  CertificateDraft,
  CertificateFilter,
  CertificateJournal,
  CertificateSettings,
} from "@domain/program/program-certificates.model";
import { evaluationError } from "@utils/evaluation-workspace";
import { fromMoscowInput, toMoscowInput } from "@utils/program-management";
import { CertificateCanvasComponent } from "./certificate-canvas.component";

@Component({
  selector: "app-management-certificates",
  imports: [
    FormsModule,
    DatePipe,
    ButtonDirective,
    FieldDirective,
    ChoiceDirective,
    AlertDirective,
    ModalComponent,
    TransientNoticeComponent,
    CertificateCanvasComponent,
  ],
  providers: [
    ProgramCertificatesUseCase,
    { provide: ProgramCertificatesRepositoryPort, useClass: ProgramCertificatesHttpAdapter },
  ],
  templateUrl: "./certificates.component.html",
  styleUrl: "./certificates.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagementCertificatesComponent {
  readonly programId = input.required<number>();
  readonly programName = input.required<string>();
  readonly confirmDiscard = input.required<() => Promise<boolean>>();
  readonly statusChange = output<{ dirty: boolean; busy: boolean }>();
  private readonly api = inject(ProgramCertificatesUseCase);
  private readonly destroy = inject(DestroyRef);
  readonly snapshot = signal<CertificateSettings | null>(null);
  readonly draft = signal<CertificateDraft | null>(null);
  readonly assets = signal<CertificateSettings["assets"]>({ background: null, signature: null });
  readonly backgroundUrl = signal<string | null>(null);
  readonly signatureUrl = signal<string | null>(null);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null, { equal: () => false });
  readonly step = signal(1);
  readonly editorOpen = signal(false);
  readonly confirmOpen = signal(false);
  readonly longName = signal(false);
  readonly journal = signal<CertificateJournal | null>(null);
  readonly journalLoading = signal(false);
  readonly journalError = signal<string | null>(null);
  readonly filter = signal<CertificateFilter>("all");
  readonly search = signal("");
  readonly offset = signal(0);
  readonly dirty = computed(
    () => JSON.stringify(this.draft()) !== JSON.stringify(this.snapshot()?.draft ?? null),
  );
  readonly recipients = computed(
    () => this.snapshot()?.eligibleCounts[this.draft()?.audience ?? "submitted"] ?? 0,
  );
  readonly signatureRatio = computed(() => {
    const a = this.assets().signature;
    return a ? a.width / a.height : 2;
  });
  readonly scheduleInput = computed(() =>
    this.draft()?.scheduledAt ? toMoscowInput(this.draft()!.scheduledAt) : "",
  );
  readonly steps = ["1. Шаблон", "2. Автовыдача", "3. Отправки"];
  readonly placeholders = "{name}, {program}, {date}, {number}";
  readonly labels = {
    pending: "В очереди",
    generating: "Создаем PDF",
    sending: "Отправляем",
    sent: "Отправлено",
    failed: "Ошибка",
    ready: "Без отправки",
  };
  private readonly searchChanges = new Subject<void>();
  private sequence = 0;
  private loadSequence = 0;
  private objectUrls = new Set<string>();
  constructor() {
    effect(() => {
      this.programId();
      untracked(() => void this.reload());
    });
    effect(() =>
      this.statusChange.emit({ dirty: this.dirty(), busy: this.busy() || this.loading() }),
    );
    this.searchChanges.pipe(debounceTime(300), takeUntilDestroyed(this.destroy)).subscribe(() => {
      this.offset.set(0);
      void this.loadJournal();
    });
    interval(15000)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe(() => {
        if (
          this.step() === 3 &&
          !this.journalLoading() &&
          !this.busy() &&
          this.snapshot()?.batch?.active
        )
          void this.loadJournal();
      });
    this.destroy.onDestroy(() => this.objectUrls.forEach(url => URL.revokeObjectURL(url)));
  }
  private observe<T>(request: Observable<T>): Promise<T> {
    return firstValueFrom(request.pipe(takeUntilDestroyed(this.destroy)));
  }
  private accept(settings: CertificateSettings): void {
    this.snapshot.set(settings);
    this.draft.set(structuredClone(settings.draft));
    this.assets.set(settings.assets);
    void this.loadAssets();
  }
  async reload(): Promise<void> {
    if (this.dirty() && !(await this.confirmDiscard()())) return;
    const sequence = ++this.loadSequence;
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.observe(this.api.settings(this.programId()));
      if (sequence === this.loadSequence) this.accept(data);
    } catch (error) {
      if (sequence === this.loadSequence) this.error.set(evaluationError(error));
    } finally {
      if (sequence === this.loadSequence) this.loading.set(false);
    }
  }
  async loadAssets(): Promise<void> {
    const assets = this.assets();
    for (const kind of ["background", "signature"] as const) {
      const target = kind === "background" ? this.backgroundUrl : this.signatureUrl;
      const asset = assets[kind];
      if (!asset) {
        this.release(target());
        target.set(null);
        continue;
      }
      try {
        const blob = await this.observe(this.api.asset(this.programId(), asset.id));
        if (this.assets()[kind]?.id !== asset.id) continue;
        this.release(target());
        const url = URL.createObjectURL(blob);
        this.objectUrls.add(url);
        target.set(url);
      } catch {
        this.error.set("Не удалось загрузить изображение. Обновите шаблон.");
      }
    }
  }
  private release(url: string | null): void {
    if (url) {
      URL.revokeObjectURL(url);
      this.objectUrls.delete(url);
    }
  }
  patch(values: Partial<CertificateDraft>): void {
    this.draft.update(d => (d ? { ...d, ...values } : d));
  }
  schedule(value: string): void {
    this.patch({ scheduledAt: value ? fromMoscowInput(value) : null });
  }
  discard(): void {
    const snapshot = this.snapshot();
    if (!snapshot) return;
    this.draft.set(structuredClone(snapshot.draft));
    this.assets.set(snapshot.assets);
    void this.loadAssets();
  }
  private async run<T>(request: () => Observable<T>, accept: (value: T) => void): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    try {
      accept(await this.observe(request()));
    } catch (error) {
      this.error.set(evaluationError(error));
    } finally {
      this.busy.set(false);
    }
  }
  save(): Promise<void> {
    return this.run(
      () => this.api.save(this.programId(), this.snapshot()!.revision, this.draft()!),
      data => {
        this.accept(data);
        this.message.set("Настройки сертификата сохранены.");
      },
    );
  }
  async upload(event: Event, kind: "background" | "signature"): Promise<void> {
    const input = event.target as HTMLInputElement,
      file = input.files?.[0];
    input.value = "";
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      this.error.set("Размер файла не должен превышать 10 МБ.");
      return;
    }
    await this.run(
      () => this.api.upload(this.programId(), kind, file),
      asset => this.setAsset(kind, asset),
    );
  }
  private setAsset(kind: "background" | "signature", asset: CertificateAsset): void {
    this.assets.update(assets => ({ ...assets, [kind]: asset }));
    this.patch(kind === "background" ? { backgroundId: asset.id } : { signatureId: asset.id });
    if (kind === "signature") {
      const draft = this.draft()!;
      const box = draft.layout.signature;
      const ratio = asset.width / asset.height;
      const height = Math.min((box.width * (297 / 210)) / ratio, 100 - box.y);
      this.patch({
        layout: {
          ...draft.layout,
          signature: { ...box, height, width: (height * ratio) / (297 / 210) },
        },
      });
    }
    void this.loadAssets();
  }
  remove(kind: "background" | "signature"): void {
    this.assets.update(assets => ({ ...assets, [kind]: null }));
    this.patch(kind === "background" ? { backgroundId: null } : { signatureId: null });
    void this.loadAssets();
  }
  resetLayout(): void {
    if (this.snapshot()) this.patch({ layout: structuredClone(this.snapshot()!.draft.layout) });
  }
  preview(): Promise<void> {
    return this.run(
      () => this.api.preview(this.programId(), this.snapshot()!.revision),
      blob => saveAs(blob, "certificate-preview.pdf"),
    );
  }
  test(): Promise<void> {
    return this.run(
      () => this.api.test(this.programId(), this.snapshot()!.revision),
      data => this.message.set(data.detail),
    );
  }
  activate(): Promise<void> {
    return this.run(
      () => this.api.activate(this.programId(), this.snapshot()!.revision),
      data => {
        this.accept(data);
        this.confirmOpen.set(false);
        this.step.set(3);
        this.message.set("Выдача запущена. Прогресс появится в журнале.");
        void this.loadJournal();
      },
    );
  }
  queue(): Promise<void> {
    return this.run(
      () => this.api.queue(this.programId(), this.snapshot()?.batch?.active ? "pause" : "resume"),
      data => {
        this.snapshot.set(data);
        void this.loadJournal();
      },
    );
  }
  setStep(step: number): void {
    this.step.set(step);
    if (step === 3) void this.loadJournal();
  }
  setFilter(filter: CertificateFilter): void {
    this.filter.set(filter);
    this.offset.set(0);
    void this.loadJournal();
  }
  searchChanged(value: string): void {
    this.search.set(value);
    this.searchChanges.next();
  }
  async loadJournal(): Promise<void> {
    const sequence = ++this.sequence;
    this.journalLoading.set(true);
    this.journalError.set(null);
    try {
      const data = await this.observe(
        this.api.journal(this.programId(), this.filter(), this.search(), this.offset()),
      );
      if (sequence === this.sequence) this.journal.set(data);
    } catch (error) {
      if (sequence === this.sequence) this.journalError.set(evaluationError(error));
    } finally {
      if (sequence === this.sequence) this.journalLoading.set(false);
    }
  }
  page(delta: number): void {
    this.offset.update(offset => Math.max(0, offset + delta * 20));
    void this.loadJournal();
  }
  retry(id?: string): Promise<void> {
    return this.run(
      () => this.api.retry(this.programId(), id ? [id] : undefined),
      data => {
        this.message.set(`Поставлено в очередь: ${data.count}.`);
        void this.loadJournal();
      },
    );
  }
  pdf(id: string): Promise<void> {
    return this.run(
      () => this.api.pdf(this.programId(), id),
      blob => saveAs(blob, `certificate-${id.slice(0, 8)}.pdf`),
    );
  }
  archive(): Promise<void> {
    return this.run(
      () => this.api.archive(this.programId(), this.filter(), this.search()),
      blob => saveAs(blob, "certificates.zip"),
    );
  }
}
