/** @format */

import {
  afterNextRender,
  DOCUMENT,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injectable,
  Injector,
  input,
  signal,
  computed,
  viewChild,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink, UrlTree } from "@angular/router";
import { ApiService } from "@corelib";
import { AppRoutes } from "@api/paths/app-routes";
import { ButtonDirective, IconComponent } from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { filter, firstValueFrom } from "rxjs";
import { ProgramGuideOverlayComponent } from "./program-guide-overlay.component";
import { PROGRAM_CONTEXT_GUIDES, PROGRAM_GUIDES, ProgramGuide } from "./program-guide-content";

const MAIN_TABS = [
  { key: "overview", label: "Обзор", icon: "additional" },
  { key: "participants", label: "Участники", icon: "team" },
  { key: "projects", label: "Проекты", icon: "projects" },
  { key: "evaluation", label: "Оценивание", icon: "medal-outlined" },
  { key: "settings", label: "Настройки", icon: "settings" },
];

interface ActiveStep {
  programId: number;
  tour: ProgramGuide;
  index: number;
  destination: UrlTree;
}

@Injectable({ providedIn: "root" })
class ProgramManagementTourState {
  private readonly router = inject(Router);
  readonly current = signal<ActiveStep | null>(null);

  constructor() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        const current = this.current();
        if (current && !this.isAt(current.destination)) this.current.set(null);
      });
  }

  isAt(destination: UrlTree): boolean {
    const current = this.router.parseUrl(this.router.url);
    const settings = destination.root.children["primary"]?.segments.at(-1)?.path === "settings";
    const tab = (url: UrlTree) => url.queryParamMap.get("tab") ?? (settings ? "basic" : null);
    const queryParams = { ...destination.queryParams };
    delete queryParams["tab"];
    return (
      tab(current) === tab(destination) &&
      this.router.isActive(new UrlTree(destination.root, queryParams, destination.fragment), {
        paths: "exact",
        queryParams: "subset",
        matrixParams: "ignored",
        fragment: "ignored",
      })
    );
  }
}

@Component({
  selector: "app-program-management-header",
  imports: [
    ButtonDirective,
    IconComponent,
    ModalComponent,
    ProgramGuideOverlayComponent,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "./management-header.component.scss",
  templateUrl: "./management-header.component.html",
})
export class ProgramManagementHeaderComponent {
  readonly programId = input.required<number>();
  readonly name = input.required<string>();
  readonly draft = input.required<boolean>();
  readonly active = input.required<string>();
  readonly status = input("");
  protected readonly tabs = MAIN_TABS;
  protected readonly topics = computed(() =>
    PROGRAM_GUIDES.filter(
      topic =>
        (!topic.requiredTab || this.tabs.some(tab => tab.key === topic.requiredTab)) &&
        (!topic.publishedOnly || !this.draft()) &&
        (!topic.draftOnly || this.draft()),
    ),
  );
  protected readonly paths = AppRoutes;
  protected readonly helpOpen = signal(false);
  protected readonly navigating = signal(false);

  private readonly api = inject(ApiService);
  private readonly document = inject(DOCUMENT);
  private readonly destroy = inject(DestroyRef);
  private readonly readiness = signal<{ programId: number; seen: ReadonlySet<string> } | null>(
    null,
  );
  private readonly shownContext = new Set<string>();
  private readonly expectedTarget = signal<HTMLElement | null>(null);
  protected readonly target = this.expectedTarget.asReadonly();
  protected readonly step = computed(() => {
    const current = this.activeStep();
    return current?.tour.steps[current.index] ?? null;
  });
  protected readonly isAutomatic = computed(() => {
    const current = this.activeStep();
    return !!current && PROGRAM_CONTEXT_GUIDES.includes(current.tour);
  });
  private readonly router = inject(Router);
  private readonly tourState = inject(ProgramManagementTourState);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private tabsObserver?: ResizeObserver;
  private readonly helpDialog = viewChild(ModalComponent);
  private readonly helpTrigger = viewChild<ElementRef<HTMLButtonElement>>("helpTrigger");
  private restoreFocus: HTMLElement | null = null;
  private missingSince = 0;
  private lastStep: ActiveStep | null = null;
  private direction = 1;
  private skipTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly programPage = computed(() =>
    this.draft()
      ? this.paths.program.preview(this.programId())
      : this.paths.program.detail(this.programId()),
  );
  readonly activeStep = computed(() => {
    const current = this.tourState.current();
    return current?.programId === this.programId() &&
      (this.topics().includes(current.tour) || PROGRAM_CONTEXT_GUIDES.includes(current.tour))
      ? current
      : null;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.tabsObserver?.disconnect());
    effect(() => {
      const active = this.active();
      afterNextRender(
        () => {
          if (this.active() === active) this.observeActiveTab();
        },
        { injector: this.injector },
      );
    });
    effect(onCleanup => {
      const programId = this.programId();
      const sub = this.api.get<{ seen: string[] }>(this.helpStatePath(programId)).subscribe({
        next: response => this.readiness.set({ programId, seen: new Set(response.seen) }),
        error: () => this.readiness.set(null),
      });
      onCleanup(() => sub.unsubscribe());
    });
    effect(() => {
      this.activeStep();
      this.readiness();
      this.helpOpen();
      this.navigating();
      afterNextRender(() => this.syncGuide(), { injector: this.injector });
    });
    afterNextRender(() => {
      if (typeof MutationObserver === "undefined") return;
      let queued = 0;
      const view = this.document.defaultView;
      const observer = new MutationObserver(() => {
        if (!view || queued) return;
        queued = view.requestAnimationFrame(() => {
          queued = 0;
          this.syncGuide();
        });
      });
      observer.observe(this.document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-program-guide", "disabled", "hidden"],
      });
      this.destroy.onDestroy(() => {
        observer.disconnect();
        if (queued) view?.cancelAnimationFrame(queued);
        clearTimeout(this.skipTimer);
      });
    });
  }

  private helpStatePath(programId: number): string {
    return `/programs/${programId}/management/help-state/`;
  }

  private findTarget(selector: string): HTMLElement | null {
    return (
      Array.from(this.document.querySelectorAll<HTMLElement>(selector)).find(
        element =>
          !element.closest("app-program-guide-overlay,[hidden],[aria-hidden='true']") &&
          (element.getClientRects().length > 0 ||
            !this.document.defaultView?.CSS?.supports?.("position", "fixed")),
      ) ?? null
    );
  }

  private syncGuide(): void {
    const current = this.activeStep();
    if (this.lastStep !== current) {
      this.lastStep = current;
      this.missingSince = Date.now();
      clearTimeout(this.skipTimer);
      this.skipTimer = undefined;
    }
    if (current) {
      const replayId =
        current.tour.id === "participants-v1"
          ? "participant-removal-v1"
          : current.tour.id === "evaluation-v1"
            ? "allocation-shortage-v1"
            : null;
      if (replayId && this.openContextGuide(replayId)) return;
      if (current.tour.id === "participants-v1" && current.index === 0) {
        const empty = PROGRAM_GUIDES.find(tour => tour.id === "participant-empty-v1");
        if (empty && this.findTarget(empty.steps[0].target)) {
          this.tourState.current.set({ ...current, tour: empty });
          return;
        }
      }
      const step = current.tour.steps[current.index];
      const target = !step.when || this.findTarget(step.when) ? this.findTarget(step.target) : null;
      this.expectedTarget.set(target);
      if (target) {
        clearTimeout(this.skipTimer);
        this.skipTimer = undefined;
        return;
      }
      if (PROGRAM_CONTEXT_GUIDES.includes(current.tour)) {
        this.tourState.current.set(null);
      } else if (step.optional && !this.skipTimer) {
        this.skipTimer = setTimeout(
          () => {
            this.skipTimer = undefined;
            if (
              this.activeStep() === current &&
              (!this.findTarget(step.target) || (step.when && !this.findTarget(step.when)))
            ) {
              this.advance(this.direction);
            }
          },
          Math.max(100, 1200 - (Date.now() - this.missingSince)),
        );
      }
      return;
    }
    this.expectedTarget.set(null);
    const ready = this.readiness();
    const programId = this.programId();
    if (ready?.programId !== programId || this.helpOpen() || this.navigating()) return;
    for (const tour of PROGRAM_CONTEXT_GUIDES) {
      if (ready.seen.has(tour.id) || this.shownContext.has(tour.id)) continue;
      if (this.openContextGuide(tour.id)) break;
    }
  }

  private openContextGuide(id: string): boolean {
    const tour = PROGRAM_CONTEXT_GUIDES.find(guide => guide.id === id);
    const target = tour && this.findTarget(tour.steps[0].target);
    if (!tour || !target) return false;
    const programId = this.programId();
    const seen = this.readiness();
    this.restoreFocus = null;
    this.expectedTarget.set(target);
    this.tourState.current.set({
      programId,
      tour,
      index: 0,
      destination: this.router.parseUrl(this.router.url),
    });
    if (!(seen?.programId === programId && seen.seen.has(id)) && !this.shownContext.has(id)) {
      this.shownContext.add(id);
      this.api.post<{ seen: string[] }>(this.helpStatePath(programId), { guide: id }).subscribe({
        error: () => undefined,
      });
    }
    return true;
  }

  private observeActiveTab(): void {
    const tabs = this.host.nativeElement.querySelector<HTMLElement>(".program-heading__tabs");
    const active = tabs?.querySelector<HTMLElement>('[aria-current="page"]');
    this.tabsObserver?.disconnect();
    if (!tabs || !active) return;
    if (typeof ResizeObserver !== "undefined") {
      this.tabsObserver ??= new ResizeObserver(() => this.revealActiveTab());
      this.tabsObserver.observe(tabs);
      this.tabsObserver.observe(active);
    }
    this.revealActiveTab();
  }

  private revealActiveTab(): void {
    const tabs = this.host.nativeElement.querySelector<HTMLElement>(".program-heading__tabs");
    const active = tabs?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!tabs || !active || tabs.scrollWidth <= tabs.clientWidth) return;

    const viewport = tabs.getBoundingClientRect();
    const item = active.getBoundingClientRect();
    const inset = 4;
    const offset =
      item.left < viewport.left + inset
        ? item.left - viewport.left - inset
        : item.right > viewport.right - inset
          ? item.right - viewport.right + inset
          : 0;
    if (offset) {
      tabs.scrollLeft = Math.max(
        0,
        Math.min(tabs.scrollLeft + offset, tabs.scrollWidth - tabs.clientWidth),
      );
    }
  }

  protected tabPath(section: string): string {
    if (section === "overview") {
      return this.draft()
        ? this.paths.program.launch(this.programId())
        : this.paths.program.management(this.programId(), "analytics");
    }
    return this.paths.program.management(
      this.programId(),
      section === "evaluation" ? "settings" : section,
    );
  }

  protected openHelp(): void {
    this.tourState.current.set(null);
    this.expectedTarget.set(null);
    this.helpOpen.set(true);
  }

  protected async startTour(tour: ProgramGuide): Promise<void> {
    this.restoreFocus = this.helpTrigger()?.nativeElement ?? null;
    this.direction = 1;
    await this.closeHelp();
    await this.showStep(tour, 0);
  }

  protected async showStep(tour: ProgramGuide, index: number): Promise<void> {
    const step = tour.steps[index];
    if (!step || this.navigating() || !this.topics().includes(tour)) return;
    const programId = this.programId();
    const destination = this.router.createUrlTree([this.tabPath(step.section)], {
      queryParams: step.tab ? { tab: step.tab } : undefined,
    });

    if (this.tourState.isAt(destination)) {
      this.tourState.current.set({ programId, tour, index, destination });
      return;
    }

    this.navigating.set(true);
    try {
      if ((await this.router.navigateByUrl(destination)) && this.tourState.isAt(destination)) {
        this.tourState.current.set({ programId, tour, index, destination });
      }
    } finally {
      this.navigating.set(false);
    }
  }

  protected advance(direction = 1): void {
    const current = this.activeStep();
    if (!current) return;
    this.direction = direction;
    const index = current.index + direction;
    if (index < 0 || index >= current.tour.steps.length) {
      this.finishTour();
      return;
    }
    void this.showStep(current.tour, index);
  }

  protected finishTour(): void {
    const automatic = this.isAutomatic();
    this.tourState.current.set(null);
    this.expectedTarget.set(null);
    const focus = this.restoreFocus?.isConnected
      ? this.restoreFocus
      : this.helpTrigger()?.nativeElement;
    this.restoreFocus = null;
    if (!automatic && focus?.isConnected) focus.focus();
  }

  private async closeHelp(): Promise<void> {
    const overlay = this.helpDialog()?.overlayRef;
    const closed = overlay?.hasAttached() ? firstValueFrom(overlay.detachments()) : undefined;
    this.helpOpen.set(false);
    await closed;
  }
}
