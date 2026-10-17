/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  Injector,
  OnInit,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from "@angular/core";
import { DatePipe, DOCUMENT } from "@angular/common";
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { HttpErrorResponse } from "@angular/common/http";
import { debounceTime, distinctUntilChanged, filter, finalize, startWith } from "rxjs";
import { A11yModule } from "@angular/cdk/a11y";
import {
  ButtonDirective,
  FieldDirective,
  TableDirective,
  ChoiceDirective,
  PaginationComponent,
  AlertDirective,
  IconComponent,
  AvatarComponent,
} from "@uilib";
import { FileService } from "@corelib";
import { ProgramManagementRepositoryPort } from "@domain/program/ports/program-management.repository.port";
import {
  ManagementMaterial,
  ManagementProject,
  ManagementSection,
  ManagementSettingsWrite,
  SettingsSection,
} from "@domain/program/program-management.model";
import { ProgramManagementHttpAdapter } from "@infrastructure/adapters/program/program-management-http.adapter";
import { ProgramManagementRepository } from "@infrastructure/repository/program/program-management.repository";
import { ProgramManagementUseCase } from "@api/program/use-cases/program-management.use-case";
import { ProgramManagementService } from "@api/program/facades/detail/program-management.service";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { AppRoutes } from "@api/paths/app-routes";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { ProgramAnalyticsComponent } from "../detail/analytics/analytics.component";
import { ProgramBrandingPreviewComponent } from "./branding-preview/branding-preview.component";
import { presentationHref } from "@utils/program-case-analytics";
import { evaluationLabel, fromMoscowInput, toMoscowInput } from "@utils/program-management";

@Component({
  selector: "app-program-management",
  templateUrl: "./management.component.html",
  styleUrl: "./management.component.scss",
  imports: [
    RouterLink,
    ReactiveFormsModule,
    DatePipe,
    A11yModule,
    ButtonDirective,
    FieldDirective,
    TableDirective,
    ChoiceDirective,
    PaginationComponent,
    AlertDirective,
    IconComponent,
    AvatarComponent,
    ModalComponent,
    ProgramAnalyticsComponent,
    ProgramBrandingPreviewComponent,
  ],
  providers: [
    ProgramManagementService,
    ProgramManagementUseCase,
    ProgramManagementRepository,
    ProgramManagementHttpAdapter,
    { provide: ProgramManagementRepositoryPort, useExisting: ProgramManagementRepository },
    ProgramDetailMainUIInfoService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramManagementComponent implements OnInit {
  readonly state = inject(ProgramManagementService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly destroyRef = inject(DestroyRef);
  private readonly files = inject(FileService);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  readonly paths = AppRoutes;
  readonly href = presentationHref;
  readonly evaluationLabel = evaluationLabel;
  readonly section = signal<ManagementSection>("participants");
  readonly settingsTab = signal<SettingsSection>("basic");
  readonly search = this.fb.control("");
  readonly caseFilter = this.fb.control("all");
  readonly submissionFilter = this.fb.control("all");
  private searchNavigation: { value: string } | null = null;
  readonly saving = signal(false);
  readonly uploading = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly saved = signal(false);
  readonly editingMaterial = signal<ManagementMaterial | "new" | null>(null);
  readonly materialDragActive = signal(false);
  readonly materialFileName = signal("");
  private materialDragDepth = 0;
  readonly confirmation = signal<{
    title: string;
    text: string;
    label: string;
    safeCancel: boolean;
  } | null>(null);
  readonly mobile = signal(window.innerWidth < 1000);
  private confirmationCallback: ((yes: boolean) => void) | null = null;
  private teamTrigger: HTMLElement | null = null;
  readonly tabs = [
    { id: "participants", label: "Участники" },
    { id: "projects", label: "Проекты" },
    { id: "analytics", label: "Аналитика" },
    { id: "settings", label: "Настройки" },
  ];
  readonly settingsTabs = [
    { id: "basic", label: "Основное" },
    { id: "dates", label: "Сроки" },
    { id: "materials", label: "Материалы" },
  ];
  readonly basicForm = this.fb.group({
    name: ["", [Validators.required, Validators.pattern(/\S/)]],
    city: [""],
    tag: [""],
    description: [""],
    imageAddress: [""],
    coverImageAddress: [""],
    advertisementImageAddress: [""],
    registrationLink: [""],
    presentationAddress: [""],
  });
  readonly datesForm = this.fb.group({
    datetimeStarted: ["", Validators.required],
    datetimeRegistrationEnds: ["", Validators.required],
    datetimeProjectSubmissionEnds: [""],
    datetimeEvaluationEnds: [""],
    datetimeFinished: ["", Validators.required],
  });
  readonly materialForm = this.fb.group({
    title: ["", Validators.required],
    mode: ["link"],
    url: [""],
    file: [""],
  });
  readonly basicFields = [
    { key: "name", label: "Название программы", required: true },
    { key: "city", label: "Город" },
    { key: "tag", label: "Тег" },
  ];
  readonly images = [
    {
      key: "coverImageAddress",
      label: "Обложка (шапка)",
      dimensions: "Рекомендуемый размер: 1800 × 320 px (примерно 5,6:1).",
      hint: "Размещайте важные детали вверху по центру: на узком экране края обрезаются, а снизу расположен логотип.",
    },
    {
      key: "imageAddress",
      label: "Логотип программы",
      dimensions: "Рекомендуемый размер: 512 × 512 px (1:1).",
      hint: "Изображение показывается в круге. Расположите знак по центру с отступами от краёв.",
    },
    {
      key: "advertisementImageAddress",
      label: "Баннер регистрации",
      dimensions: "Рекомендуемая ширина: 1800 px.",
      hint: "Высоту можно выбрать любую — баннер показывается целиком и не обрезается. Его видят будущие участники программы.",
    },
  ];
  readonly dateFields = [
    { key: "datetimeStarted", label: "Начало программы" },
    { key: "datetimeRegistrationEnds", label: "Окончание регистрации" },
    { key: "datetimeProjectSubmissionEnds", label: "Окончание приёма решений" },
    { key: "datetimeEvaluationEnds", label: "Окончание оценивания" },
    { key: "datetimeFinished", label: "Окончание программы" },
  ];
  readonly count = computed(() =>
    this.section() === "participants"
      ? (this.state.participants()?.count ?? 0)
      : (this.state.projects()?.count ?? 0),
  );
  readonly offset = computed(() =>
    this.state.projects() || this.state.participants()
      ? (this.state.context?.query.offset ?? 0)
      : 0,
  );
  readonly rangeEnd = computed(() => Math.min(this.offset() + 25, this.count()));
  readonly modalOpen = computed(() => !!this.confirmation() || !!this.editingMaterial());
  readonly requestError = computed(() => this.errorMessage(this.state.error()));

  constructor() {
    effect(() => {
      const program = this.state.program();
      if (program) untracked(() => this.resetForms());
    });
    this.destroyRef.onDestroy(() => {
      this.confirmationCallback?.(false);
    });
  }
  @HostListener("window:resize") onResize(): void {
    this.mobile.set(window.innerWidth < 1000);
  }
  @HostListener("window:beforeunload", ["$event"]) onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.dirty() || this.saving() || this.uploading()) {
      event.preventDefault();
      event.returnValue = "";
    }
  }
  ngOnInit(): void {
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.submitSearch());
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        const raw =
          this.route.snapshot.data["managementSection"] ??
          this.route.snapshot.paramMap.get("section");
        const section = [
          "participants",
          "projects",
          "analytics",
          "settings",
          "evaluation",
        ].includes(raw)
          ? (raw as ManagementSection)
          : "participants";
        const q = this.route.snapshot.queryParamMap;
        const tab = q.get("tab");
        this.settingsTab.set(tab === "dates" || tab === "materials" ? tab : "basic");
        this.section.set(section);
        this.formError.set(null);
        this.saved.set(false);
        const offset = Number(q.get("offset") ?? 0),
          id = Number(this.route.parent?.snapshot.paramMap.get("programId"));
        if (!Number.isSafeInteger(id) || id < 1) return;
        const routeSearch = q.get("search") ?? "";
        const previous = this.state.context;
        const sameList = previous?.programId === id && previous.section === section;
        if (
          !sameList ||
          (routeSearch !== previous.query.search && routeSearch !== this.searchNavigation?.value)
        ) {
          this.search.setValue(routeSearch, { emitEvent: false });
        }
        const caseScope = q.get("case_scope");
        this.caseFilter.setValue(
          caseScope === "selected"
            ? `case:${q.get("case_name") ?? ""}`
            : caseScope === "without_case"
              ? "without_case"
              : "all",
          { emitEvent: false },
        );
        this.submissionFilter.setValue(q.get("submission") ?? "all", { emitEvent: false });
        this.state.load({
          programId: id,
          section,
          linkId: Number(this.route.snapshot.paramMap.get("linkId")) || undefined,
          selectedId: Number(q.get("selected")) || undefined,
          query: {
            search: (q.get("search") ?? "").slice(0, 200),
            offset: Number.isSafeInteger(offset) && offset >= 0 ? offset : 0,
            limit: 25,
            submission:
              q.get("submission") === "submitted"
                ? "submitted"
                : q.get("submission") === "not_submitted"
                  ? "not_submitted"
                  : "all",
            caseScope:
              q.get("case_scope") === "selected"
                ? "selected"
                : q.get("case_scope") === "without_case"
                  ? "without_case"
                  : "all",
            caseName: q.get("case_name") ?? undefined,
          },
        });
      });
  }
  changeQuery(patch: Record<string, string | number | null>): Promise<boolean> {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...patch, selected: null },
      queryParamsHandling: "merge",
    });
  }
  submitSearch(): void {
    const navigation = { value: this.search.value.trim() };
    this.searchNavigation = navigation;
    void this.changeQuery({ search: navigation.value || null, offset: 0 }).finally(() => {
      if (this.searchNavigation === navigation) this.searchNavigation = null;
    });
  }
  page(delta: number): void {
    void this.changeQuery({ offset: Math.max(0, this.offset() + delta * 25) });
  }
  changeCase(value: string): void {
    void this.changeQuery({
      case_scope: value === "all" || value === "without_case" ? value : "selected",
      case_name: value.startsWith("case:") ? value.slice(5) : null,
      offset: 0,
    });
  }
  select(project: ManagementProject): void {
    if (this.state.pending()) return;
    if (this.state.selected()?.id === project.id) this.state.clearSelection();
    else this.state.select(project);
  }
  selectFromRow(event: MouseEvent, project: ManagementProject): void {
    if (!(event.target as HTMLElement).closest("a,button,input,label")) this.select(project);
  }
  openTeam(event: Event): void {
    this.teamTrigger = event.currentTarget as HTMLElement;
    this.state.openTeam();
    afterNextRender(() => this.document.getElementById("management-team-heading")?.focus(), {
      injector: this.injector,
    });
  }
  closeTeam(): void {
    this.state.closeTeam();
    this.teamTrigger?.focus();
  }
  evaluationPath(linkId: number): string {
    return `${AppRoutes.program.management(this.state.program()!.id, "projects")}/${linkId}/evaluation`;
  }
  returnQuery(): Record<string, string | number> {
    return {
      ...this.route.snapshot.queryParams,
      selected: this.state.selected()?.id ?? Number(this.route.snapshot.paramMap.get("linkId")),
    };
  }
  dirty(): boolean {
    return this.basicForm.dirty || this.datesForm.dirty || this.materialForm.dirty;
  }
  async canLeave(): Promise<boolean> {
    if (this.saving() || this.uploading()) return false;
    if (!this.dirty()) return true;
    const yes = await this.confirm(
      "Есть несохранённые изменения",
      "При выходе изменения будут потеряны.",
      "Выйти без сохранения",
      true,
    );
    if (yes) {
      this.basicForm.markAsPristine();
      this.datesForm.markAsPristine();
      this.materialForm.markAsPristine();
      this.editingMaterial.set(null);
    }
    return yes;
  }
  async reload(): Promise<void> {
    if (await this.canLeave()) this.state.retry();
  }
  resetForms(): void {
    const p = this.state.program();
    if (!p) return;
    this.basicForm.reset({
      name: p.name,
      city: p.city,
      tag: p.tag,
      description: p.description ?? "",
      imageAddress: p.imageAddress ?? "",
      coverImageAddress: p.coverImageAddress ?? "",
      advertisementImageAddress: p.advertisementImageAddress ?? "",
      registrationLink: p.registrationLink ?? "",
      presentationAddress: p.presentationAddress ?? "",
    });
    this.datesForm.reset({
      datetimeStarted: toMoscowInput(p.datetimeStarted),
      datetimeRegistrationEnds: toMoscowInput(p.datetimeRegistrationEnds),
      datetimeProjectSubmissionEnds: toMoscowInput(p.datetimeProjectSubmissionEnds),
      datetimeEvaluationEnds: toMoscowInput(p.datetimeEvaluationEnds),
      datetimeFinished: toMoscowInput(p.datetimeFinished),
    });
  }
  save(confirmReopen = false): void {
    const p = this.state.program(),
      section = this.settingsTab();
    if (!p || section === "materials" || this.saving() || this.uploading()) return;
    const form = section === "basic" ? this.basicForm : this.datesForm;
    if (form.invalid) {
      form.markAllAsTouched();
      this.formError.set("Заполните обязательные поля.");
      return;
    }
    const body: ManagementSettingsWrite = { expectedUpdatedAt: p.updatedAt, confirmReopen };
    for (const [name, control] of Object.entries(form.controls))
      if (control.dirty)
        body[name] = section === "dates" ? fromMoscowInput(control.value) : control.value;
    this.saving.set(true);
    this.formError.set(null);
    this.saved.set(false);
    this.state.api
      .save(p.id, section, body)
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: program => {
          this.state.program.set(program);
          this.resetForms();
          this.saved.set(true);
        },
        error: (error: HttpErrorResponse) => {
          if (error.error?.code === "reopen_confirmation_required")
            void this.confirm(
              "Снова открыть приём?",
              error.error.detail,
              "Подтвердить и сохранить",
            ).then(yes => {
              if (yes) this.save(true);
            });
          else this.formError.set(this.errorMessage(error));
        },
      });
  }
  upload(event: Event, target: string): void {
    const input = event.target as HTMLInputElement,
      file = input.files?.[0];
    input.value = "";
    if (!file) return;
    this.uploadFile(file, target);
  }
  private uploadFile(file: File, target: string): void {
    if (this.saving() || this.uploading()) return;
    if (target === "material") {
      this.materialForm.controls.mode.setValue("file");
      this.materialForm.controls.mode.markAsDirty();
    }
    if (target !== "material" && !file.type.startsWith("image/")) {
      this.formError.set("Выберите изображение.");
      return;
    }
    this.uploading.set(target);
    this.formError.set(null);
    this.files
      .uploadFile(file)
      .pipe(
        finalize(() => {
          this.uploading.set(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ url }) => {
          const control =
            target === "material" ? this.materialForm.controls.file : this.basicForm.get(target);
          control?.setValue(url);
          control?.markAsDirty();
          if (target === "material") this.materialFileName.set(file.name);
        },
        error: (error: HttpErrorResponse) =>
          this.formError.set(
            error.status === 413
              ? "Файл слишком большой. Выберите файл меньшего размера."
              : this.errorMessage(error),
          ),
      });
  }
  onMaterialDragEnter(event: DragEvent): void {
    if (!event.dataTransfer?.types.includes("Files")) return;
    event.preventDefault();
    this.materialDragDepth++;
    if (!this.saving() && !this.uploading()) this.materialDragActive.set(true);
  }
  onMaterialDragOver(event: DragEvent): void {
    if (!event.dataTransfer?.types.includes("Files")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = this.saving() || this.uploading() ? "none" : "copy";
  }
  onMaterialDragLeave(): void {
    this.materialDragDepth = Math.max(0, this.materialDragDepth - 1);
    if (!this.materialDragDepth) this.materialDragActive.set(false);
  }
  onMaterialDrop(event: DragEvent): void {
    const files = event.dataTransfer?.files;
    this.resetMaterialDrag();
    if (!event.dataTransfer?.types.includes("Files")) return;
    event.preventDefault();
    event.stopPropagation();
    if (!this.editingMaterial() || this.saving() || this.uploading()) return;
    if (files?.length !== 1) {
      this.formError.set("Добавляйте по одному файлу в каждый материал.");
      return;
    }
    this.uploadFile(files[0], "material");
  }
  private resetMaterialDrag(): void {
    this.materialDragDepth = 0;
    this.materialDragActive.set(false);
  }
  editMaterial(material: ManagementMaterial | "new"): void {
    this.resetMaterialDrag();
    this.materialFileName.set(material === "new" ? "" : (material.file?.name ?? ""));
    this.editingMaterial.set(material);
    this.formError.set(null);
    this.materialForm.reset(
      material === "new"
        ? { title: "", mode: "link", url: "", file: "" }
        : {
            title: material.title,
            mode: material.file ? "file" : "link",
            url: material.file ? "" : material.url,
            file: material.file?.link ?? "",
          },
    );
  }
  async closeMaterial(): Promise<void> {
    if (this.saving() || this.uploading()) return;
    this.resetMaterialDrag();
    if (
      this.materialForm.dirty &&
      !(await this.confirm(
        "Закрыть без сохранения?",
        "Изменения материала будут потеряны.",
        "Закрыть без сохранения",
        true,
      ))
    )
      return;
    this.editingMaterial.set(null);
    this.materialForm.markAsPristine();
    this.formError.set(null);
  }
  saveMaterial(): void {
    const p = this.state.program(),
      current = this.editingMaterial(),
      value = this.materialForm.getRawValue();
    if (!p || !current || this.saving() || this.uploading()) return;
    if (this.materialForm.invalid || !(value.mode === "file" ? value.file : value.url)) {
      this.formError.set("Укажите название и файл или ссылку.");
      return;
    }
    this.saving.set(true);
    this.formError.set(null);
    this.state.api
      .saveMaterial(
        p.id,
        {
          title: value.title,
          url: value.mode === "link" ? value.url : null,
          file: value.mode === "file" ? value.file : null,
          expectedUpdatedAt: current === "new" ? undefined : current.updatedAt,
        },
        current === "new" ? undefined : current.id,
      )
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: material => {
          this.state.program.update(p =>
            p
              ? {
                  ...p,
                  materials: [...p.materials.filter(m => m.id !== material.id), material].sort(
                    (a, b) => a.id - b.id,
                  ),
                }
              : p,
          );
          this.editingMaterial.set(null);
          this.materialForm.markAsPristine();
          this.saved.set(true);
        },
        error: (error: HttpErrorResponse) => this.formError.set(this.errorMessage(error)),
      });
  }
  async deleteMaterial(material: ManagementMaterial): Promise<void> {
    const p = this.state.program();
    if (
      !p ||
      this.saving() ||
      !(await this.confirm(
        "Удалить материал?",
        `«${material.title}» исчезнет из программы. Исходный файл сохранится.`,
        "Удалить материал",
      ))
    )
      return;
    this.saving.set(true);
    this.formError.set(null);
    this.state.api
      .deleteMaterial(p.id, material)
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.state.program.update(p =>
            p ? { ...p, materials: p.materials.filter(m => m.id !== material.id) } : p,
          );
          this.saved.set(true);
        },
        error: (error: HttpErrorResponse) => this.formError.set(this.errorMessage(error)),
      });
  }
  private confirm(
    title: string,
    text: string,
    label: string,
    safeCancel = false,
  ): Promise<boolean> {
    this.confirmationCallback?.(false);
    this.confirmation.set({ title, text, label, safeCancel });
    return new Promise(resolve => {
      this.confirmationCallback = resolve;
    });
  }
  resolveConfirmation(yes: boolean): void {
    const callback = this.confirmationCallback;
    this.confirmationCallback = null;
    this.confirmation.set(null);
    callback?.(yes);
  }
  dismissModal(): void {
    if (this.confirmation()) this.resolveConfirmation(false);
    else void this.closeMaterial();
  }
  errorMessage(error: HttpErrorResponse | null): string {
    if (error?.status === 403) return "У вас нет доступа к управлению этой программой.";
    if (error?.status === 401) return "Войдите в аккаунт, чтобы продолжить.";
    if (error?.status === 404) return "Программа или выбранный объект не найдены.";
    if (error?.status === 409)
      return error.error?.detail ?? "Данные изменились. Обновите страницу перед сохранением.";
    if (error?.status === 400)
      return "Проверьте введённые значения и ссылки. Изменения сохранены в форме.";
    return "Не удалось выполнить запрос. Проверьте соединение и повторите попытку.";
  }
}
