/** @format */

import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { AppRoutes } from "@api/paths/app-routes";
import { ButtonDirective, IconComponent } from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";

const STEP_PLURAL = new Intl.PluralRules("ru-RU");

const MAIN_TABS = [
  { key: "overview", label: "Обзор", icon: "additional" },
  { key: "participants", label: "Участники", icon: "team" },
  { key: "projects", label: "Проекты", icon: "projects" },
  { key: "evaluation", label: "Оценивание", icon: "medal-outlined" },
  { key: "settings", label: "Настройки", icon: "settings" },
];

const TOURS = [
  {
    key: "main",
    title: "Основные вкладки",
    steps: [
      {
        section: "overview",
        title: "Обзор",
        text: "В черновике здесь видно, что нужно для запуска. После публикации здесь аналитика программы.",
      },
      {
        section: "participants",
        title: "Участники",
        text: "Здесь регистрации и последняя активность. Выберите строки, чтобы выполнить действие сразу для нескольких участников.",
      },
      {
        section: "projects",
        title: "Проекты",
        text: "Здесь проектные копии команд, их кейсы и статусы сдачи. Действия с отдельной работой доступны в меню строки.",
      },
      {
        section: "settings",
        tab: "criteria",
        title: "Оценивание",
        text: "Настройте критерии, добавьте экспертов и распределите между ними сданные проекты.",
      },
      {
        section: "settings",
        title: "Настройки",
        text: "Здесь редактируются страница, сроки, анкета регистрации, требования к проекту и состав организаторов.",
      },
    ],
  },
  {
    key: "settings",
    title: "Настройки программы",
    steps: [
      {
        section: "settings",
        tab: "basic",
        title: "Страница",
        text: "Заполните название и описание. Проверьте, как обложка и аватар выглядят на компьютере и телефоне.",
      },
      {
        section: "settings",
        tab: "dates",
        title: "Сроки",
        text: "Здесь задаются даты программы, закрытия регистрации, сдачи работ и оценивания.",
      },
      {
        section: "settings",
        tab: "registration",
        title: "Регистрация",
        text: "Выберите способ регистрации и настройте анкету, которую заполнят участники.",
      },
      {
        section: "settings",
        tab: "project-form",
        title: "Заявка проекта",
        text: "Выберите разделы и поля для проектной копии. Перед сохранением проверьте форму глазами участника.",
      },
      {
        section: "settings",
        tab: "materials",
        title: "Материалы",
        text: "Добавьте ссылки и файлы, которые понадобятся участникам программы.",
      },
      {
        section: "settings",
        tab: "organizers",
        title: "Организаторы",
        text: "Пригласите коллег и управляйте доступом к программе из меню рядом с их именами.",
      },
    ],
  },
  {
    key: "evaluation",
    title: "Оценивание",
    steps: [
      {
        section: "settings",
        tab: "criteria",
        title: "Критерии",
        text: "Задайте, за что эксперты ставят баллы.",
      },
      {
        section: "experts",
        title: "Эксперты",
        text: "Пригласите экспертов и укажите, какие кейсы они оценивают.",
      },
      {
        section: "projects",
        title: "Распределение",
        text: "Выберите сданные проекты, чтобы назначить им экспертов.",
      },
      {
        section: "results",
        title: "Результаты",
        text: "Откройте строку проекта, чтобы увидеть его оценки и прогресс.",
      },
    ],
  },
] satisfies {
  key: string;
  title: string;
  steps: { section: string; tab?: string; title: string; text: string }[];
}[];

@Component({
  selector: "app-program-management-header",
  imports: [ButtonDirective, IconComponent, ModalComponent, RouterLink],
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
  readonly tabs = MAIN_TABS;
  readonly topics = TOURS;
  readonly paths = AppRoutes;
  readonly training = signal(false);
  private readonly router = inject(Router);
  private readonly query = toSignal(inject(ActivatedRoute).queryParamMap);
  readonly tour = computed(() =>
    this.topics.find(topic => topic.key === this.query()?.get("tour")),
  );
  readonly index = computed(() => {
    const value = Number(this.query()?.get("step") ?? 0);
    return Number.isInteger(value) && value >= 0 ? value : 0;
  });
  readonly step = computed(() => this.tour()?.steps[this.index()]);

  protected stepCount(count: number): string {
    const form = STEP_PLURAL.select(count);
    return `${count} ${form === "one" ? "шаг" : form === "few" ? "шага" : "шагов"}`;
  }

  tabPath(section: string): string {
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

  showStep(topicKey: string, index: number): void {
    const step = this.topics.find(topic => topic.key === topicKey)?.steps[index];
    if (!step) return;
    this.training.set(false);
    void this.router.navigate([this.tabPath(step.section)], {
      queryParams: { tab: "tab" in step ? step.tab : null, tour: topicKey, step: index },
    });
  }

  finishTour(): void {
    void this.router.navigate([], {
      queryParams: { tour: null, step: null },
      queryParamsHandling: "merge",
    });
  }
}
