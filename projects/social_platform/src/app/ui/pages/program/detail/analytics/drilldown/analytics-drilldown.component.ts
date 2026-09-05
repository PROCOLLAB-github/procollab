/** @format */
import { A11yModule, CdkTrapFocus } from "@angular/cdk/a11y";
import {
  AfterViewInit,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  untracked,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NgTemplateOutlet } from "@angular/common";
import { ProgramAnalyticsDrilldownService } from "@api/program/facades/detail/program-analytics-drilldown.service";
import {
  ProgramAnalyticsAssignmentScope,
  ProgramAnalyticsAssignmentStatus,
  ProgramAnalyticsDelayedExperts,
} from "@domain/program/program-analytics.model";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import {
  analyticsRequestError,
  assignmentCriterionValue,
  assignmentProgress,
  assignmentStatusLabels,
  formatAssignmentWaiting,
} from "@utils/program-analytics-assignment";

/** Локальная доступность поверх public OverlayRef; shared modal API не расширяется. */
@Component({
  selector: "app-analytics-drilldown",
  templateUrl: "./analytics-drilldown.component.html",
  styleUrl: "./analytics-drilldown.component.scss",
  imports: [A11yModule, ModalComponent, AvatarComponent, NgTemplateOutlet],
  providers: [ProgramAnalyticsDrilldownService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AnalyticsDrilldownComponent implements AfterViewInit {
  readonly programId = input<number | null>(null);
  readonly delayedExperts = input<ProgramAnalyticsDelayedExperts>({ total: 0, items: [] });
  protected readonly state = inject(ProgramAnalyticsDrilldownService);
  private readonly destroyRef = inject(DestroyRef);
  private trigger: HTMLElement | null = null;
  private focusedView = this.state.view();
  private previousProgramId: number | null = null;
  protected readonly attached = signal(false);

  @ViewChild(ModalComponent) private modal!: ModalComponent;
  @ViewChild(ModalComponent, { read: ViewContainerRef }) private modalContainer!: ViewContainerRef;
  @ViewChild(CdkTrapFocus) private trap!: CdkTrapFocus;
  @ViewChild("closeButton") private closeButton!: ElementRef<HTMLButtonElement>;
  @ViewChild("heading") private heading!: ElementRef<HTMLHeadingElement>;

  protected readonly statusLabel = (status: ProgramAnalyticsAssignmentStatus): string =>
    assignmentStatusLabels[status];
  protected readonly waiting = formatAssignmentWaiting;
  protected readonly progress = assignmentProgress;
  protected readonly criterionValue = assignmentCriterionValue;
  protected readonly requestError = analyticsRequestError;
  protected readonly title = computed(() => {
    switch (this.state.view()) {
      case "scores":
        return "Оценка проекта";
      case "delayed":
        return "Задержки экспертов";
      case "backlog":
        return this.state.selectedExpert()?.fullName || "Ожидающие назначения";
      default:
        return {
          all: "Все назначения экспертов",
          completed: "Выполненные назначения",
          pending: "Ожидают оценки",
        }[this.state.scope()];
    }
  });
  protected readonly emptyMessage = computed(
    () =>
      ({
        all: "Назначений экспертов пока нет",
        completed: "Завершённых оценок пока нет",
        pending: "Все назначения выполнены",
      })[this.state.scope()],
  );

  constructor() {
    effect(() => {
      const id = this.programId();
      if (id !== this.previousProgramId) {
        this.previousProgramId = id;
        untracked(() => {
          this.trigger = null;
          this.closeAnalyticsModal();
        });
      }
    });
    // Angular render lifecycle, не ожидание DOM: один постоянный heading меняет текст/id.
    afterRenderEffect(() => {
      const view = this.state.view();
      if (this.attached() && this.state.open() && view !== this.focusedView) {
        this.focusedView = view;
        this.heading.nativeElement.focus();
      }
    });
    this.destroyRef.onDestroy(() => {
      this.trigger = null;
      this.state.close();
    });
  }

  ngAfterViewInit(): void {
    const overlay = this.modal.overlayRef!;
    const overlayOwner = this.modalContainer.injector.get(DestroyRef);
    overlay
      .attachments()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        // Shared primitive прикрепляет portal асинхронно: уже отменённое открытие не захватывает focus.
        if (!this.state.open()) {
          overlay.detach();
          return;
        }
        this.attached.set(true);
        this.focusedView = this.state.view();
        // Portal уже в DOM. AutoCapture выключен, чтобы CDK не восстанавливал disconnected focus.
        this.trap.focusTrap.attachAnchors();
        this.trap.enabled = true;
        this.closeButton.nativeElement.focus();
      });
    overlay
      .detachments()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.attached.set(false);
        this.trap.enabled = false;
        this.state.close();
        const trigger = this.trigger;
        this.trigger = null;
        // Дочерний modal может detach в ngOnDestroy раньше callback родителя.
        if (!overlayOwner.destroyed && !this.destroyRef.destroyed && trigger?.isConnected)
          trigger.focus();
      });
    overlay
      .keydownEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (event.key === "Escape" && overlay.hasAttached()) {
          event.preventDefault();
          event.stopPropagation();
          this.closeAnalyticsModal();
        }
      });
  }

  /** Сохраняем именно нажатую кнопку, а не selector или document.activeElement. */
  openAssignments(scope: ProgramAnalyticsAssignmentScope, trigger: HTMLElement): void {
    const id = this.programId();
    if (id === null || this.state.open() || this.attached()) return;
    this.trigger = trigger;
    this.state.openAssignments(id, scope);
  }

  openDelayed(trigger: HTMLElement): void {
    const id = this.programId();
    if (id === null || this.state.open() || this.attached()) return;
    this.trigger = trigger;
    this.state.openDelayed(id, this.delayedExperts());
  }

  /** Backdrop, Escape и кнопка закрывают весь drilldown. Фокус возвращается на detach. */
  closeAnalyticsModal(): void {
    this.state.close();
  }

  protected onOpenChange(open: boolean): void {
    if (!open) this.closeAnalyticsModal();
  }
}
