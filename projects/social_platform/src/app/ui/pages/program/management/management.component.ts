/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  Injector,
  OnInit,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from "@angular/core";
import { DatePipe, DOCUMENT } from "@angular/common";
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { HttpErrorResponse } from "@angular/common/http";
import { authLoginUrl } from "@core/lib/models/auth/auth-return-url";
import { debounceTime, distinctUntilChanged, filter, finalize, startWith } from "rxjs";
import { saveAs } from "file-saver";
import { A11yModule } from "@angular/cdk/a11y";
import { CdkMenuModule } from "@angular/cdk/menu";
import { ConnectedPosition } from "@angular/cdk/overlay";
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
  ManagementParticipant,
  ManagementProject,
  ManagementSection,
  ManagementSettingsWrite,
  SettingsSection,
  ManagementSelectionProject,
  ParticipantRemovalPreview,
  ManagementProjectAction,
} from "@domain/program/program-management.model";
import { ProgramManagementHttpAdapter } from "@infrastructure/adapters/program/program-management-http.adapter";
import { ProgramManagementRepository } from "@infrastructure/repository/program/program-management.repository";
import { ProgramManagementUseCase } from "@api/program/use-cases/program-management.use-case";
import { ProgramManagementService } from "@api/program/facades/detail/program-management.service";
import { ProgramProjectAssignmentSelection } from "@api/program/facades/detail/program-project-assignment-selection.service";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { AppRoutes } from "@api/paths/app-routes";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import {
  RowAction,
  RowActionEvent,
  RowActionsComponent,
} from "@ui/primitives/row-actions/row-actions.component";
import { ProgramAnalyticsComponent } from "../detail/analytics/analytics.component";
import { ProgramBrandingPreviewComponent } from "./branding-preview/branding-preview.component";
import {
  ManagementProjectActionsComponent,
  ProjectActionRequest,
  ProjectActionDone,
} from "./project-actions/project-actions.component";
import { ManagementProjectFormComponent } from "./project-form/project-form.component";
import { ManagementCriteriaComponent } from "./criteria/criteria.component";
import { ManagementExpertsComponent } from "./experts/experts.component";
import { ResultProjectScoresComponent } from "./results/result-project-scores.component";
import { ManagementResultsComponent } from "./results/results.component";
import { ManagementOrganizersComponent } from "./organizers/organizers.component";
import { ManagementRegistrationComponent } from "./registration/registration.component";
import { presentationHref } from "@utils/program-case-analytics";
import { evaluationLabel, fromMoscowInput, toMoscowInput } from "@utils/program-management";
import { DEFAULT_IMAGE_FRAME, programImageFraming } from "@utils/program-branding";
import { ProgramImageFraming, ProgramImageKey } from "@domain/program/program-image-framing.model";

@Component({
  selector: "app-program-management",
  templateUrl: "./management.component.html",
  styleUrl: "./management.component.scss",
  imports: [
    RouterLink,
    ReactiveFormsModule,
    DatePipe,
    A11yModule,
    CdkMenuModule,
    ButtonDirective,
    FieldDirective,
    TableDirective,
    ChoiceDirective,
    PaginationComponent,
    AlertDirective,
    IconComponent,
    AvatarComponent,
    ModalComponent,
    RowActionsComponent,
    ProgramAnalyticsComponent,
    ProgramBrandingPreviewComponent,
    ManagementProjectActionsComponent,
    ManagementProjectFormComponent,
    ManagementCriteriaComponent,
    ManagementExpertsComponent,
    ManagementResultsComponent,
    ResultProjectScoresComponent,
    ManagementOrganizersComponent,
    ManagementRegistrationComponent,
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
  private readonly assignmentSelection = inject(ProgramProjectAssignmentSelection);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly destroyRef = inject(DestroyRef);
  private readonly files = inject(FileService);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  readonly paths = AppRoutes;
  signIn(): void {
    void this.router.navigateByUrl(authLoginUrl(this.router.url));
  }
  readonly href = presentationHref;
  readonly evaluationLabel = evaluationLabel;
  readonly section = signal<ManagementSection>("participants");
  readonly settingsTab = signal<SettingsSection>("basic");
  readonly search = this.fb.control("");
  readonly caseFilter = this.fb.control("all");
  readonly submissionFilter = this.fb.control("all");
  readonly evaluationFilter = this.fb.control("all");
  readonly regionFilter = this.fb.control("all");
  readonly activityFilter = this.fb.control("all");
  readonly activityFrom = this.fb.control("");
  readonly activityTo = this.fb.control("");
  readonly participantFiltersForm = this.fb.group({
    region: this.regionFilter,
    activity: this.activityFilter,
    from: this.activityFrom,
    to: this.activityTo,
  });
  readonly activityOrder = signal<"activity_asc" | "activity_desc">("activity_desc");
  readonly activitySortLabel = computed(() =>
    this.activityOrder() === "activity_desc" ? "Сначала активные" : "Сначала неактивные",
  );
  readonly projectFiltersOpen = signal(false);
  readonly projectFilterCount = signal(0);
  readonly projectFiltersForm = this.fb.group({
    case: this.caseFilter,
    submission: this.submissionFilter,
    evaluation: this.evaluationFilter,
  });
  readonly exportingProjects = signal(false);
  readonly projectExportError = signal(false);
  readonly projectExportSuccess = signal(false);
  readonly participantFiltersOpen = signal(false);
  readonly participantFilterCount = signal(0);
  readonly activitySortOptions = [
    { value: "activity_desc", label: "Сначала активные", icon: "sort-activity-desc" },
    { value: "activity_asc", label: "Сначала неактивные", icon: "sort-activity-asc" },
  ] as const;
  readonly activitySortPositions: ConnectedPosition[] = [
    { originX: "end", originY: "bottom", overlayX: "end", overlayY: "top", offsetY: 4 },
    { originX: "end", originY: "top", overlayX: "end", overlayY: "bottom", offsetY: -4 },
  ];
  readonly participantFilterError = signal<string | null>(null);
  readonly exportingParticipants = signal(false);
  readonly participantExportError = signal(false);
  readonly participantExportSuccess = signal(false);
  readonly participantAnswers = signal<ManagementParticipant | null>(null);
  readonly selectedRows = signal(new Set<number>());
  readonly selectedRowIds = computed(() => [...this.selectedRows()]);
  readonly selectedProjects = signal(new Map<number, ManagementSelectionProject>());
  readonly projectActionRequest = signal<ProjectActionRequest | null>(null);
  readonly projectActionBusy = signal(false);
  private projectActionTrigger: HTMLElement | null = null;
  readonly selectingRows = signal(false);
  readonly participantRemoval = signal<{
    ids: number[];
    preview: ParticipantRemovalPreview;
  } | null>(null);
  readonly removingParticipants = signal(false);
  readonly tableError = signal<string | null>(null);
  readonly tableMessage = signal<string | null>(null);
  private selectionKey = "";
  private selectionSequence = 0;
  readonly allRowsSelected = computed(
    () => this.count() > 0 && this.selectedRows().size === this.count(),
  );
  readonly assignmentReason = computed(() => {
    if (!this.state.program()?.isCompetitive) return "В программе нет оценивания.";
    const projects = [...this.selectedProjects().values()];
    if (projects.length !== this.selectedRows().size) return "Обновите выбор проектов.";
    if (projects.some(p => !p.submitted)) return "В выборе есть проекты без сданного решения.";
    if (projects.some(p => p.draft))
      return "В выборе есть черновики заявок. Команде нужно завершить оформление заявки.";
    if (new Set(projects.map(p => p.caseName)).size > 1)
      return "Для ручного назначения выберите проекты одного кейса.";
    return null;
  });
  readonly hasListFilters = computed(() => {
    const q = this.state.context?.query;
    // Depend on the list signals: context is updated before the request resolves.
    this.state.participants();
    this.state.projects();
    return (
      !!q &&
      (!!q.search ||
        (this.section() === "participants"
          ? (q.regionScope ?? "all") !== "all" || (q.activity ?? "all") !== "all"
          : q.caseScope !== "all" || q.submission !== "all" || (q.evaluation ?? "all") !== "all"))
    );
  });
  private searchNavigation: { value: string } | null = null;
  readonly saving = signal(false);
  readonly uploading = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly saved = signal(false);
  readonly projectForm = viewChild(ManagementProjectFormComponent);
  private readonly managementLayout = viewChild<ElementRef<HTMLElement>>("managementLayout");
  readonly floatingPosition = signal<{ center: number; width: number } | null>(null);
  readonly projectFormStatus = signal({ dirty: false, busy: false });
  readonly criteriaForm = viewChild(ManagementCriteriaComponent);
  readonly criteriaStatus = signal({ dirty: false, busy: false });
  readonly expertsStatus = signal({ dirty: false, busy: false });
  readonly expertsForm = viewChild(ManagementExpertsComponent);
  readonly organizersForm = viewChild(ManagementOrganizersComponent);
  readonly organizersStatus = signal({ dirty: false, busy: false });
  readonly registrationForm = viewChild(ManagementRegistrationComponent);
  readonly registrationStatus = signal({ dirty: false, busy: false });
  organizerAccessRemoved(): void {
    const id = this.state.program()?.id;
    this.organizersStatus.set({ dirty: false, busy: false });
    this.state.program.set(null);
    void this.router.navigateByUrl(id ? AppRoutes.program.detail(id) : "/office/program");
  }
  readonly confirmProjectFormDiscard = () =>
    this.confirm(
      "Есть несохраненные изменения",
      "При выходе изменения будут потеряны.",
      "Выйти без сохранения",
      true,
    );
  projectFormSaved(updatedAt: string): void {
    this.state.program.update(program => (program ? { ...program, updatedAt } : program));
  }
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
    { id: "experts", label: "Эксперты" },
    { id: "results", label: "Результаты" },
    { id: "analytics", label: "Аналитика" },
    { id: "settings", label: "Настройки" },
  ];
  readonly settingsTabs = [
    { id: "basic", label: "Основное" },
    { id: "dates", label: "Сроки" },
    { id: "materials", label: "Материалы" },
    { id: "project-form", label: "Кейсы и поля" },
    { id: "criteria", label: "Оценивание" },
    { id: "organizers", label: "Организаторы" },
    { id: "registration", label: "Регистрация" },
  ];
  readonly basicForm = this.fb.group({
    name: ["", [Validators.required, Validators.pattern(/\S/)]],
    city: [""],
    tag: [""],
    description: [""],
    imageAddress: [""],
    coverImageAddress: [""],
    mobileCoverImageAddress: [""],
    imageFraming: this.fb.control<ProgramImageFraming>(programImageFraming()),
    advertisementImageAddress: [""],
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
      key: "mobileCoverImageAddress",
      label: "Обложка для телефона",
      dimensions: "Рекомендуемый размер: 960 × 400 px (примерно 2,4:1).",
      hint: "Необязательно. Без отдельного файла используется основная обложка. Кадр для телефона можно настроить независимо.",
    },
    {
      key: "imageAddress",
      label: "Логотип программы",
      dimensions: "Рекомендуемый размер: 512 × 512 px (1:1).",
      hint: "Изображение показывается в круге. Расположите знак по центру с отступами от краев.",
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
    { key: "datetimeProjectSubmissionEnds", label: "Окончание приема решений" },
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
  readonly pageSize = 20;
  readonly rangeEnd = computed(() => Math.min(this.offset() + this.pageSize, this.count()));
  readonly modalOpen = computed(() => !!this.confirmation() || !!this.editingMaterial());
  readonly requestError = computed(() => this.errorMessage(this.state.error()));

  constructor() {
    afterNextRender(() => {
      const layout = this.managementLayout()?.nativeElement;
      if (!layout) return;
      const update = () => {
        const rect = layout.getBoundingClientRect();
        if (rect.width > 0) {
          this.floatingPosition.set({
            center: rect.left + rect.width / 2,
            width: Math.min(704, rect.width, window.innerWidth - 32),
          });
        }
      };
      const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
      observer?.observe(layout);
      window.addEventListener("resize", update);
      update();
      this.destroyRef.onDestroy(() => {
        observer?.disconnect();
        window.removeEventListener("resize", update);
      });
    });
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
    if (
      this.dirty() ||
      this.saving() ||
      this.uploading() ||
      this.projectActionBusy() ||
      this.projectFormStatus().busy ||
      this.criteriaStatus().busy ||
      this.expertsStatus().busy ||
      this.organizersStatus().busy ||
      this.registrationStatus().busy
    ) {
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
          "experts",
          "results",
          "analytics",
          "settings",
          "evaluation",
        ].includes(raw)
          ? (raw as ManagementSection)
          : "participants";
        const q = this.route.snapshot.queryParamMap;
        const tab = q.get("tab");
        this.settingsTab.set(
          tab === "dates" ||
            tab === "materials" ||
            tab === "project-form" ||
            tab === "criteria" ||
            tab === "organizers" ||
            tab === "registration"
            ? tab
            : "basic",
        );
        this.section.set(section);
        const selectionKey = JSON.stringify([
          section,
          this.route.parent?.snapshot.paramMap.get("programId"),
          q.keys
            .filter(key => key !== "offset" && key !== "selected")
            .sort()
            .map(key => [key, q.getAll(key)]),
        ]);
        if (selectionKey !== this.selectionKey) {
          this.clearRows();
          this.projectActionRequest.set(null);
          this.participantRemoval.set(null);
          this.tableError.set(null);
          this.tableMessage.set(null);
          this.selectionKey = selectionKey;
        }
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
        this.evaluationFilter.setValue(q.get("evaluation") ?? "all", { emitEvent: false });
        this.regionFilter.setValue(
          q.get("region_scope") === "selected"
            ? `region:${q.get("region") ?? ""}`
            : q.get("region_scope") === "without_region"
              ? "without_region"
              : "all",
          { emitEvent: false },
        );
        const activity = q.get("activity");
        const activityMode =
          activity === "never"
            ? "inactive"
            : activity === "period" || activity === "active" || activity === "inactive"
              ? activity
              : "all";
        const order = q.get("order");
        this.activityOrder.set(order === "activity_asc" ? "activity_asc" : "activity_desc");
        this.activityFilter.setValue(activityMode, { emitEvent: false });
        this.activityFrom.setValue(q.get("activity_from") ?? "", { emitEvent: false });
        this.activityTo.setValue(q.get("activity_to") ?? "", { emitEvent: false });
        this.participantFilterCount.set(
          Number(this.regionFilter.value !== "all") + Number(activityMode !== "all"),
        );
        this.closeParticipantFilters();
        this.participantFilterError.set(null);
        this.participantExportSuccess.set(false);
        this.projectExportSuccess.set(false);
        this.projectExportError.set(false);
        this.projectFilterCount.set(
          Number(this.caseFilter.value !== "all") +
            Number(this.submissionFilter.value !== "all") +
            Number(this.evaluationFilter.value !== "all"),
        );
        this.closeProjectFilters();
        this.state.load({
          programId: id,
          section,
          linkId: Number(this.route.snapshot.paramMap.get("linkId")) || undefined,
          selectedId: Number(q.get("selected")) || undefined,
          query: {
            search: (q.get("search") ?? "").slice(0, 200),
            offset: Number.isSafeInteger(offset) && offset >= 0 ? offset : 0,
            limit: this.pageSize,
            evaluation:
              q.get("evaluation") === "evaluated"
                ? "evaluated"
                : q.get("evaluation") === "not_evaluated"
                  ? "not_evaluated"
                  : "all",
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
            regionScope:
              q.get("region_scope") === "selected"
                ? "selected"
                : q.get("region_scope") === "without_region"
                  ? "without_region"
                  : "all",
            region: q.get("region") ?? undefined,
            activity: activityMode,
            order: this.activityOrder(),
            activityFrom: q.get("activity_from") ?? undefined,
            activityTo: q.get("activity_to") ?? undefined,
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
    void this.changeQuery({ offset: Math.max(0, this.offset() + delta * this.pageSize) });
  }
  sortByActivity(order: "activity_asc" | "activity_desc"): void {
    void this.changeQuery({
      order,
      offset: 0,
    });
  }
  openProjectFilters(): void {
    const q = this.state.context?.query;
    this.caseFilter.setValue(
      q?.caseScope === "selected"
        ? `case:${q.caseName ?? ""}`
        : q?.caseScope === "without_case"
          ? "without_case"
          : "all",
    );
    this.submissionFilter.setValue(q?.submission ?? "all");
    this.evaluationFilter.setValue(q?.evaluation ?? "all");
    this.projectFiltersOpen.set(true);
  }
  closeProjectFilters(): void {
    this.projectFiltersOpen.set(false);
  }
  resetProjectFilterDraft(): void {
    this.caseFilter.setValue("all");
    this.submissionFilter.setValue("all");
    this.evaluationFilter.setValue("all");
  }
  applyProjectFilters(): void {
    const key = this.caseFilter.value;
    void this.changeQuery({
      case_scope: key.startsWith("case:")
        ? "selected"
        : key === "without_case"
          ? "without_case"
          : null,
      case_name: key.startsWith("case:") ? key.slice(5) : null,
      submission: this.state.program()?.isCompetitive ? this.submissionFilter.value : null,
      evaluation: this.state.program()?.isCompetitive ? this.evaluationFilter.value : null,
      offset: 0,
    });
    this.closeProjectFilters();
  }
  exportProjects(): void {
    const ctx = this.state.context;
    if (!ctx || this.exportingProjects() || !this.count()) return;
    this.exportingProjects.set(true);
    this.projectExportError.set(false);
    this.projectExportSuccess.set(false);
    this.state.api
      .exportProjects(ctx.programId, { ...ctx.query, search: this.search.value.trim() })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.exportingProjects.set(false)),
      )
      .subscribe({
        next: file => {
          saveAs(file, `program-${ctx.programId}-projects.xlsx`);
          if (this.state.context?.programId === ctx.programId && this.section() === "projects")
            this.projectExportSuccess.set(true);
        },
        error: () => {
          if (this.state.context?.programId === ctx.programId && this.section() === "projects")
            this.projectExportError.set(true);
        },
      });
  }
  openParticipantFilters(): void {
    const q = this.state.context?.query;
    this.regionFilter.setValue(
      q?.regionScope === "selected"
        ? `region:${q.region ?? ""}`
        : q?.regionScope === "without_region"
          ? "without_region"
          : "all",
    );
    this.activityFilter.setValue(q?.activity === "never" ? "inactive" : (q?.activity ?? "all"));
    this.activityFrom.setValue(q?.activityFrom ?? "");
    this.activityTo.setValue(q?.activityTo ?? "");
    this.participantFilterError.set(null);
    this.participantFiltersOpen.set(true);
  }
  closeParticipantFilters(): void {
    this.participantFiltersOpen.set(false);
    this.participantFilterError.set(null);
  }
  resetParticipantFilterDraft(): void {
    this.regionFilter.setValue("all");
    this.activityFilter.setValue("all");
    this.activityFrom.setValue("");
    this.activityTo.setValue("");
    this.participantFilterError.set(null);
  }
  applyParticipantFilters(): void {
    const mode = this.activityFilter.value,
      from = this.activityFrom.value,
      to = this.activityTo.value;
    if (mode === "period" && ((!from && !to) || (from && to && from > to))) {
      this.participantFilterError.set(
        !from && !to
          ? "Укажите начало или конец периода."
          : "Конец периода должен быть не раньше начала.",
      );
      return;
    }
    this.participantFilterError.set(null);
    const region = this.regionFilter.value;
    void this.changeQuery({
      region_scope: region.startsWith("region:")
        ? "selected"
        : region === "without_region"
          ? "without_region"
          : null,
      region: region.startsWith("region:") ? region.slice(7) : null,
      activity: mode === "all" ? null : mode,
      activity_from: mode === "period" ? from || null : null,
      activity_to: mode === "period" ? to || null : null,
      offset: 0,
    });
    this.closeParticipantFilters();
  }
  resetListFilters(): void {
    void this.changeQuery({
      search: null,
      case_scope: null,
      case_name: null,
      submission: null,
      evaluation: null,
      region_scope: null,
      region: null,
      activity: null,
      activity_from: null,
      activity_to: null,
      offset: 0,
    });
  }
  exportParticipants(): void {
    const ctx = this.state.context;
    if (!ctx || this.exportingParticipants() || this.participantFilterError()) return;
    this.exportingParticipants.set(true);
    this.participantExportError.set(false);
    this.participantExportSuccess.set(false);
    this.state.api
      .exportParticipants(ctx.programId, { ...ctx.query, search: this.search.value.trim() })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.exportingParticipants.set(false)),
      )
      .subscribe({
        next: file => {
          saveAs(file, `program-${ctx.programId}-participants.xlsx`);
          this.participantExportSuccess.set(true);
        },
        error: () => this.participantExportError.set(true),
      });
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
  clearRows(): void {
    ++this.selectionSequence;
    this.selectingRows.set(false);
    this.selectedRows.set(new Set());
    this.selectedProjects.set(new Map());
  }
  toggleRow(row: ManagementParticipant | ManagementProject): void {
    if (this.state.pending() || this.selectingRows() || this.removingParticipants()) return;
    const ids = new Set(this.selectedRows()),
      projects = new Map(this.selectedProjects());
    if (ids.has(row.id)) {
      ids.delete(row.id);
      projects.delete(row.id);
    } else {
      ids.add(row.id);
      if ("projectId" in row)
        projects.set(row.id, {
          id: row.id,
          projectId: row.projectId,
          submitted: row.submitted,
          caseName: row.caseName,
          draft: !!row.draft,
        });
    }
    this.selectedRows.set(ids);
    this.selectedProjects.set(projects);
  }
  selectAllRows(): void {
    const ctx = this.state.context,
      kind = this.section();
    if (
      !ctx ||
      (kind !== "participants" && kind !== "projects") ||
      this.selectingRows() ||
      this.state.pending()
    )
      return;
    if (this.allRowsSelected()) {
      this.clearRows();
      return;
    }
    const key = this.selectionKey,
      seq = ++this.selectionSequence;
    this.selectingRows.set(true);
    this.tableError.set(null);
    this.state.api
      .selection(ctx.programId, kind, ctx.query)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (seq === this.selectionSequence) this.selectingRows.set(false);
        }),
      )
      .subscribe({
        next: result => {
          if (key !== this.selectionKey || seq !== this.selectionSequence) return;
          this.selectedRows.set(new Set(result.ids));
          this.selectedProjects.set(new Map((result.projects ?? []).map(p => [p.id, p])));
        },
        error: () => {
          if (seq === this.selectionSequence)
            this.tableError.set("Не удалось выбрать все записи. Повторите попытку.");
        },
      });
  }
  assignSelectedProjects(): void {
    if (!this.selectedRows().size || this.assignmentReason()) return;
    const id = this.state.program()!.id;
    this.assignmentSelection.set(
      id,
      [...this.selectedProjects().values()].map(p => p.projectId),
    );
    void this.router.navigateByUrl(this.paths.program.management(id, "experts"));
  }
  exportSelectedParticipants(): void {
    const ctx = this.state.context;
    if (!ctx || !this.selectedRows().size || this.exportingParticipants()) return;
    this.exportingParticipants.set(true);
    this.tableError.set(null);
    this.state.api
      .exportSelectedParticipants(ctx.programId, [...this.selectedRows()])
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.exportingParticipants.set(false)),
      )
      .subscribe({
        next: file => saveAs(file, `program-${ctx.programId}-participants.xlsx`),
        error: () =>
          this.tableError.set(
            "Не удалось выгрузить выбранных участников. Обновите список и повторите попытку.",
          ),
      });
  }
  previewParticipantRemoval(ids: number[]): void {
    const ctx = this.state.context;
    if (!ctx || !ids.length || this.removingParticipants()) return;
    const key = this.selectionKey;
    this.removingParticipants.set(true);
    this.tableError.set(null);
    this.state.api
      .previewParticipantRemoval(ctx.programId, ids)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.removingParticipants.set(false)),
      )
      .subscribe({
        next: preview => {
          if (key === this.selectionKey) this.participantRemoval.set({ ids, preview });
        },
        error: e => {
          if (key === this.selectionKey) this.tableError.set(this.errorMessage(e));
        },
      });
  }
  removeParticipants(): void {
    const removal = this.participantRemoval(),
      ctx = this.state.context;
    if (!removal || !ctx || this.removingParticipants()) return;
    this.removingParticipants.set(true);
    this.tableError.set(null);
    this.state.api
      .removeParticipants(ctx.programId, removal.ids, removal.preview.previewToken)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.removingParticipants.set(false)),
      )
      .subscribe({
        next: result => {
          this.participantRemoval.set(null);
          this.clearRows();
          this.tableMessage.set(`Удалено участников из программы: ${result.removed}.`);
          const lastOffset =
            Math.max(0, Math.ceil((this.count() - result.removed) / this.pageSize) - 1) *
            this.pageSize;
          if (this.offset() > lastOffset) void this.changeQuery({ offset: lastOffset });
          else this.state.retry();
        },
        error: e => {
          this.participantRemoval.set(null);
          this.tableError.set(this.errorMessage(e));
        },
      });
  }
  selectFromRow(event: MouseEvent, project: ManagementProject): void {
    if (!(event.target as HTMLElement).closest("a,button,input,label")) this.select(project);
  }
  clearProjectSelection(): void {
    const selectedId = this.state.selected()?.id;
    this.state.clearSelection();
    afterNextRender(
      () =>
        this.managementLayout()
          ?.nativeElement.querySelector<HTMLInputElement>(
            `input[name="management-project"][value="${selectedId}"]`,
          )
          ?.focus({ preventScroll: true }),
      { injector: this.injector },
    );
  }
  projectActions(project: ManagementProject): RowAction[] {
    const competitive = this.state.program()?.isCompetitive;
    const actions: RowAction[] = [
      { id: "team", label: "Посмотреть команду" },
      {
        id: "evaluation",
        label: "Перейти к оценке",
        routerLink: this.evaluationPath(project.id),
        queryParams: { ...this.returnQuery(), selected: project.id },
        disabled: !competitive || !project.submitted,
        reason: !competitive
          ? "В программе нет оценивания"
          : !project.submitted
            ? "Решение еще не сдано"
            : undefined,
      },
    ];
    const presentation = this.href(project.presentationUrl);
    if (presentation)
      actions.push({ id: "presentation", label: "Открыть презентацию", href: presentation });
    actions.push(
      {
        id: "change_case",
        label: "Сменить кейс",
        disabled: !this.state.projects()?.caseOptions.length,
        reason: "В программе не настроены кейсы",
      },
      {
        id: "submit",
        label: "Сдать решение",
        disabled: !competitive || project.submitted,
        reason: project.submitted ? "Решение уже сдано" : "В программе нет сдачи решений",
      },
      { id: "detach", label: "Открепить от программы", destructive: true },
    );
    return actions;
  }
  projectAction(project: ManagementProject, event: RowActionEvent): void {
    if (event.id === "team") {
      this.state.select(project);
      this.openTeam(event.trigger);
    } else if (["change_case", "detach", "submit"].includes(event.id)) {
      this.openProjectAction(
        event.id as ManagementProjectAction,
        [project.id],
        project.name,
        event.trigger,
      );
    }
  }
  openProjectAction(
    action: ManagementProjectAction,
    ids = this.selectedRowIds(),
    projectName?: string,
    trigger?: HTMLElement,
  ): void {
    const context = this.state.context;
    if (!context || !ids.length || this.projectActionBusy()) return;
    this.projectActionTrigger =
      trigger ??
      (this.managementLayout()?.nativeElement.ownerDocument.activeElement as HTMLElement | null);
    this.projectActionRequest.set({
      programId: context.programId,
      action,
      ids: [...ids],
      projectName,
    });
  }
  projectActionCompleted(result: ProjectActionDone): void {
    const context = this.state.context;
    if (!context || context.programId !== result.programId || this.section() !== "projects") return;
    this.projectActionRequest.set(null);
    this.clearRows();
    this.tableMessage.set(
      result.action === "change_case"
        ? "Кейс проекта изменен."
        : result.action === "detach"
          ? "Проект откреплен от программы."
          : `Сдано решений: ${result.changedCount}.`,
    );
    const leavesSelection =
      result.action === "detach" ||
      (result.action === "change_case" && context.query.caseScope !== "all") ||
      (result.action === "submit" && context.query.submission === "not_submitted");
    const remaining = this.count() - (leavesSelection ? result.changedCount : 0);
    const lastOffset = Math.max(0, Math.ceil(remaining / this.pageSize) - 1) * this.pageSize;
    if (this.offset() > lastOffset) void this.changeQuery({ offset: lastOffset });
    else this.state.retry();
  }
  closeProjectAction(): void {
    if (this.projectActionBusy()) return;
    const trigger = this.projectActionTrigger;
    this.projectActionTrigger = null;
    this.projectActionRequest.set(null);
    afterNextRender(
      () => {
        setTimeout(() => {
          if (trigger?.isConnected) trigger.focus({ preventScroll: true });
        });
      },
      { injector: this.injector },
    );
  }
  materialActions(): RowAction[] {
    return [
      { id: "edit", label: "Изменить" },
      { id: "delete", label: "Удалить", destructive: true },
    ];
  }
  materialAction(material: ManagementMaterial, event: RowActionEvent): void {
    if (event.id === "edit") this.editMaterial(material);
    else if (event.id === "delete") void this.deleteMaterial(material);
  }
  participantActions(person: ManagementParticipant): RowAction[] {
    const actions: RowAction[] = [
      {
        id: "profile",
        label: "Открыть профиль",
        routerLink: this.paths.profile.detail(person.userId),
      },
    ];
    if (person.registrationAnswers?.length)
      actions.push({ id: "answers", label: "Посмотреть анкету" });
    actions.push({ id: "remove", label: "Удалить из программы", destructive: true });
    return actions;
  }
  participantAction(person: ManagementParticipant, event: RowActionEvent): void {
    if (event.id === "answers") this.participantAnswers.set(person);
    else if (event.id === "remove") this.previewParticipantRemoval([person.id]);
  }
  openTeam(event: Event | HTMLElement): void {
    this.teamTrigger = event instanceof HTMLElement ? event : (event.currentTarget as HTMLElement);
    this.state.openTeam();
    afterNextRender(() => this.document.getElementById("management-team-heading")?.focus(), {
      injector: this.injector,
    });
  }
  closeTeam(): void {
    this.state.closeTeam();
    afterNextRender(() => this.teamTrigger?.focus({ preventScroll: true }), {
      injector: this.injector,
    });
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
    return (
      this.basicForm.dirty ||
      this.datesForm.dirty ||
      this.materialForm.dirty ||
      this.projectFormStatus().dirty ||
      this.criteriaStatus().dirty ||
      this.expertsStatus().dirty ||
      this.organizersStatus().dirty ||
      this.registrationStatus().dirty
    );
  }
  async canLeave(): Promise<boolean> {
    if (
      this.saving() ||
      this.removingParticipants() ||
      this.projectActionBusy() ||
      this.uploading() ||
      this.projectFormStatus().busy ||
      this.criteriaStatus().busy ||
      this.expertsStatus().busy ||
      this.organizersStatus().busy ||
      this.registrationStatus().busy
    )
      return false;
    if (!this.dirty()) return true;
    const yes = await this.confirm(
      "Есть несохраненные изменения",
      "При выходе изменения будут потеряны.",
      "Выйти без сохранения",
      true,
    );
    if (yes) {
      this.basicForm.markAsPristine();
      this.datesForm.markAsPristine();
      this.materialForm.markAsPristine();
      this.editingMaterial.set(null);
      this.projectForm()?.discard();
      this.projectFormStatus.set({ dirty: false, busy: false });
      this.criteriaForm()?.discard();
      this.criteriaStatus.set({ dirty: false, busy: false });
      this.expertsForm()?.discard();
      this.expertsStatus.set({ dirty: false, busy: false });
      this.organizersForm()?.discard();
      this.organizersStatus.set({ dirty: false, busy: false });
      this.registrationForm()?.discard();
      this.registrationStatus.set({ dirty: false, busy: false });
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
      mobileCoverImageAddress: p.mobileCoverImageAddress ?? "",
      imageFraming: programImageFraming(p.imageFraming),
      advertisementImageAddress: p.advertisementImageAddress ?? "",
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
    if (
      !p ||
      section === "materials" ||
      section === "project-form" ||
      section === "criteria" ||
      section === "organizers" ||
      section === "registration" ||
      this.saving() ||
      this.uploading()
    )
      return;
    const form = section === "basic" ? this.basicForm : this.datesForm;
    if (form.invalid) {
      form.markAllAsTouched();
      this.formError.set("Заполните обязательные поля.");
      return;
    }
    const body: ManagementSettingsWrite = { expectedUpdatedAt: p.updatedAt, confirmReopen };
    for (const [name, control] of Object.entries(form.controls))
      if (control.dirty)
        body[name] =
          section === "dates" && typeof control.value === "string"
            ? fromMoscowInput(control.value)
            : control.value;
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
              "Снова открыть прием?",
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
          if (target !== "material") this.resetFrameForImage(target);
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
  clearImage(target: string): void {
    if (this.saving() || this.uploading()) return;
    const control = this.basicForm.get(target);
    control?.setValue("");
    control?.markAsDirty();
    this.resetFrameForImage(target);
  }
  changeFraming(value: ProgramImageFraming): void {
    if (this.saving() || this.uploading()) return;
    this.basicForm.controls.imageFraming.setValue(value);
    this.basicForm.controls.imageFraming.markAsDirty();
  }
  private resetFrameForImage(target: string): void {
    const keys: Record<string, ProgramImageKey> = {
      imageAddress: "logo",
      coverImageAddress: "cover",
      mobileCoverImageAddress: "mobileCover",
    };
    const key = keys[target];
    if (!key) return;
    const framing = programImageFraming(this.basicForm.controls.imageFraming.value);
    framing[key] = { ...DEFAULT_IMAGE_FRAME };
    if (key === "cover" && !this.basicForm.controls.mobileCoverImageAddress.value)
      framing.mobileCover = { ...DEFAULT_IMAGE_FRAME };
    this.basicForm.controls.imageFraming.setValue(framing);
    this.basicForm.controls.imageFraming.markAsDirty();
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
      return "Проверьте введенные значения и ссылки. Изменения сохранены в форме.";
    return "Не удалось выполнить запрос. Проверьте соединение и повторите попытку.";
  }
}
