/** @format */

import {
  afterNextRender,
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
  TemplateRef,
  ViewChild,
  viewChild,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink, UrlTree } from "@angular/router";
import { AppRoutes } from "@api/paths/app-routes";
import { ButtonDirective, IconComponent } from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { filter, firstValueFrom } from "rxjs";

const MAIN_TABS = [
  { key: "overview", label: "Обзор", icon: "additional" },
  { key: "participants", label: "Участники", icon: "team" },
  { key: "projects", label: "Проекты", icon: "projects" },
  { key: "evaluation", label: "Оценивание", icon: "medal-outlined" },
  { key: "settings", label: "Настройки", icon: "settings" },
];

interface TourStep {
  section: string;
  tab?: string;
  title: string;
  text: string;
}

interface Tour {
  title: string;
  description?: string;
  requiredTab?: string;
  publishedOnly?: boolean;
  steps: readonly TourStep[];
}

const TOURS: readonly Tour[] = [
  {
    title: "Участники",
    description: "Поиск · фильтры · выгрузка",
    steps: [
      {
        section: "participants",
        title: "Список участников",
        text: "Найдите участника по имени или почте. Используйте фильтры, чтобы сузить список.",
      },
      {
        section: "participants",
        title: "Выгрузка участников",
        text: "Скачайте список участников в Excel с помощью кнопки рядом с фильтрами.",
      },
    ],
  },
  {
    title: "Проекты",
    description: "Список · действия · выгрузка",
    requiredTab: "projects",
    steps: [
      {
        section: "projects",
        title: "Список проектов",
        text: "Найдите проект по названию или используйте фильтры.",
      },
      {
        section: "projects",
        title: "Карточка проекта",
        text: "Откройте проект, чтобы посмотреть его данные.",
      },
      {
        section: "projects",
        title: "Действия с проектом",
        text: "В меню проекта доступны действия и просмотр команды.",
      },
      {
        section: "projects",
        title: "Выгрузка",
        text: "Выгрузите проекты с учетом выбранных фильтров.",
      },
    ],
  },
  {
    title: "Оценивание",
    description: "Критерии · эксперты · результаты",
    requiredTab: "evaluation",
    steps: [
      {
        section: "settings",
        tab: "criteria",
        title: "Критерии",
        text: "Настройте критерии до первой оценки.",
      },
      {
        section: "experts",
        title: "Эксперты",
        text: "Укажите, какие кейсы оценит каждый эксперт",
      },
      {
        section: "projects",
        tab: "allocation",
        title: "Распределение",
        text: "Назначьте экспертов вручную или автоматически",
      },
      {
        section: "results",
        title: "Результаты",
        text: "Откройте проект, чтобы увидеть оценки экспертов",
      },
    ],
  },
  {
    title: "Настройки",
    description: "Страница · сроки · анкеты",
    requiredTab: "settings",
    steps: [
      {
        section: "settings",
        tab: "basic",
        title: "Страница",
        text: "Заполните информацию, которую увидят участники.",
      },
      {
        section: "settings",
        tab: "dates",
        title: "Сроки",
        text: "Укажите даты программы и регистрации.",
      },
      {
        section: "settings",
        tab: "registration",
        title: "Регистрация",
        text: "Настройте вопросы для участников при регистрации.",
      },
      {
        section: "settings",
        tab: "project-form",
        title: "Заявка проекта",
        text: "Настройте поля, которые заполнит команда проекта.",
      },
      {
        section: "settings",
        tab: "materials",
        title: "Материалы",
        text: "Добавьте документы и ссылки для участников.",
      },
      {
        section: "settings",
        tab: "organizers",
        title: "Организаторы",
        text: "Пригласите коллег к управлению программой.",
      },
    ],
  },
  {
    title: "Аналитика",
    description: "Показатели · воронки · выгрузка",
    publishedOnly: true,
    steps: [
      {
        section: "analytics",
        title: "Показатели",
        text: "Посмотрите показатели участников и проектов программы.",
      },
      {
        section: "analytics",
        title: "Требует внимания",
        text: "Нажмите на число больше нуля, чтобы открыть список.",
      },
      {
        section: "analytics",
        title: "Воронки и динамика",
        text: "Сравните этапы участия и активность за 30 дней.",
      },
      {
        section: "analytics",
        title: "Выгрузка",
        text: "Скачайте данные программы через кнопку выгрузки.",
      },
    ],
  },
];

interface ActiveStep {
  programId: number;
  tour: Tour;
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
  imports: [ButtonDirective, IconComponent, ModalComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: "./management-header.component.scss",
  templateUrl: "./management-header.component.html",
})
export class ProgramManagementHeaderComponent {
  @ViewChild("coachContent", { static: true }) readonly coachTemplate!: TemplateRef<unknown>;
  readonly programId = input.required<number>();
  readonly name = input.required<string>();
  readonly draft = input.required<boolean>();
  readonly active = input.required<string>();
  readonly status = input("");
  protected readonly tabs = MAIN_TABS;
  protected readonly topics = computed(() =>
    TOURS.filter(
      topic =>
        (!topic.requiredTab || this.tabs.some(tab => tab.key === topic.requiredTab)) &&
        (!topic.publishedOnly || !this.draft()),
    ),
  );
  protected readonly paths = AppRoutes;
  protected readonly helpOpen = signal(false);
  protected readonly navigating = signal(false);

  private readonly router = inject(Router);
  private readonly tourState = inject(ProgramManagementTourState);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private tabsObserver?: ResizeObserver;
  private readonly helpDialog = viewChild(ModalComponent);
  private readonly helpTrigger = viewChild<ElementRef<HTMLButtonElement>>("helpTrigger");
  private readonly coachTitle = viewChild<ElementRef<HTMLElement>>("coachTitle");

  protected readonly programPage = computed(() =>
    this.draft()
      ? this.paths.program.preview(this.programId())
      : this.paths.program.detail(this.programId()),
  );
  readonly activeStep = computed(() => {
    const current = this.tourState.current();
    return current?.programId === this.programId() && this.topics().includes(current.tour)
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
    effect(() => {
      const current = this.activeStep();
      if (!current) return;
      afterNextRender(
        () => {
          if (this.activeStep() === current) this.coachTitle()?.nativeElement.focus();
        },
        { injector: this.injector },
      );
    });
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

  protected async startTour(tour: Tour): Promise<void> {
    await this.closeHelp();
    await this.showStep(tour, 0);
  }

  protected async showStep(tour: Tour, index: number): Promise<void> {
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

  protected finishTour(): void {
    this.tourState.current.set(null);
    this.helpTrigger()?.nativeElement.focus();
  }

  private async closeHelp(): Promise<void> {
    const overlay = this.helpDialog()?.overlayRef;
    const closed = overlay?.hasAttached() ? firstValueFrom(overlay.detachments()) : undefined;
    this.helpOpen.set(false);
    await closed;
  }
}
