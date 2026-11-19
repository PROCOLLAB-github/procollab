/** @format */

import { NgTemplateOutlet } from "@angular/common";
import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { RouterTestingHarness } from "@angular/router/testing";
import { AppRoutes } from "@api/paths/app-routes";
import { canLeaveManagement } from "@ui/routes/program/management-leave.guard";
import { ProgramManagementHeaderComponent } from "./management-header.component";

const program = AppRoutes.program;
const programId = 12;

@Component({
  imports: [ProgramManagementHeaderComponent, NgTemplateOutlet],
  template: `
    <app-program-management-header
      #header
      [programId]="programId"
      [name]="'Город будущего'"
      [draft]="draft()"
      [active]="active()"
    />
    @if (header.activeStep()) {
      <ng-container [ngTemplateOutlet]="header.coachTemplate" />
    }
  `,
})
class HeaderPage {
  readonly programId = programId;
  readonly draft = signal(true);
  readonly active = signal("overview");
  readonly canLeave = vi.fn(() => true);
}

describe(ProgramManagementHeaderComponent.name, () => {
  let harness: RouterTestingHarness;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: "office/program/:programId",
            children: [
              { path: "launch", component: HeaderPage },
              { path: "preview", component: HeaderPage },
              {
                path: "management/:section",
                component: HeaderPage,
                canDeactivate: [canLeaveManagement],
                runGuardsAndResolvers: "always",
              },
            ],
          },
        ]),
      ],
    });
    harness = await RouterTestingHarness.create();
    router = TestBed.inject(Router);
  });

  function click(label: string, root: ParentNode = harness.routeNativeElement!) {
    const button = Array.from(root.querySelectorAll("button")).find(
      element => (element.getAttribute("aria-label") ?? element.textContent?.trim()) === label,
    );
    expect(button).toBeDefined();
    button!.click();
    harness.detectChanges();
  }

  async function openHelp(): Promise<HTMLElement> {
    click("Помощь по программе");
    return vi.waitFor(() => {
      const dialog = document.querySelector<HTMLElement>(
        '[role="dialog"][aria-labelledby="program-help"]',
      );
      expect(dialog).not.toBeNull();
      return dialog!;
    });
  }

  function expectCoach(title: string, step: string) {
    harness.detectChanges();
    const page = harness.routeNativeElement!;
    expect(page.querySelector("#program-coach-title")?.textContent?.trim()).toBe(title);
    expect(page.querySelector("#program-coach-step")?.textContent?.trim()).toBe(step);
  }

  it("reveals the active tab horizontally when a narrow navigation strip overflows", async () => {
    const host = await harness.navigateByUrl(program.launch(programId), HeaderPage);
    const tabs = harness.routeNativeElement!.querySelector<HTMLElement>(".program-heading__tabs")!;
    const links = tabs.querySelectorAll<HTMLAnchorElement>("a");
    Object.defineProperties(tabs, {
      scrollWidth: { configurable: true, value: 600 },
      clientWidth: { configurable: true, value: 300 },
    });
    vi.spyOn(tabs, "getBoundingClientRect").mockReturnValue({
      left: 20,
      right: 320,
    } as DOMRect);
    vi.spyOn(links[3], "getBoundingClientRect").mockReturnValue({
      left: 360,
      right: 480,
    } as DOMRect);
    host.active.set("evaluation");
    harness.detectChanges();
    await vi.waitFor(() => expect(tabs.scrollLeft).toBe(164));

    vi.spyOn(links[0], "getBoundingClientRect").mockReturnValue({
      left: -144,
      right: -54,
    } as DOMRect);
    host.active.set("overview");
    harness.detectChanges();
    await vi.waitFor(() => expect(tabs.scrollLeft).toBe(0));
  });

  it("does not scroll a navigation strip that already fits its container", async () => {
    const host = await harness.navigateByUrl(program.launch(programId), HeaderPage);
    const tabs = harness.routeNativeElement!.querySelector<HTMLElement>(".program-heading__tabs")!;
    Object.defineProperties(tabs, {
      scrollWidth: { configurable: true, value: 860 },
      clientWidth: { configurable: true, value: 860 },
    });
    const measure = vi.spyOn(tabs, "getBoundingClientRect");
    host.active.set("evaluation");
    harness.detectChanges();
    expect(tabs.scrollLeft).toBe(0);
    expect(measure).not.toHaveBeenCalled();
  });

  it("reveals the active tab again when its width changes after rendering", async () => {
    const observers: Array<{ callback: () => void; targets: Element[] }> = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        targets: Element[] = [];
        constructor(readonly callback: () => void) {
          observers.push(this);
        }
        observe(target: Element) {
          this.targets.push(target);
        }
        disconnect() {
          this.targets = [];
        }
      },
    );
    try {
      const host = await harness.navigateByUrl(program.launch(programId), HeaderPage);
      const tabs =
        harness.routeNativeElement!.querySelector<HTMLElement>(".program-heading__tabs")!;
      const evaluation = tabs.querySelectorAll<HTMLAnchorElement>("a")[3];
      Object.defineProperties(tabs, {
        scrollWidth: { configurable: true, value: 569 },
        clientWidth: { configurable: true, value: 335 },
      });
      tabs.scrollLeft = 98;
      vi.spyOn(tabs, "getBoundingClientRect").mockReturnValue({
        left: 20,
        right: 355,
      } as DOMRect);
      const measure = vi.spyOn(evaluation, "getBoundingClientRect").mockReturnValue({
        left: 236.97,
        right: 351,
      } as DOMRect);
      host.active.set("evaluation");
      harness.detectChanges();
      await vi.waitFor(() =>
        expect(observers.some(observer => observer.targets.includes(evaluation))).toBe(true),
      );
      expect(tabs.scrollLeft).toBe(98);

      measure.mockReturnValue({ left: 236.97, right: 365.625 } as DOMRect);
      observers.find(observer => observer.targets.includes(evaluation))!.callback();
      expect(tabs.scrollLeft).toBe(112.625);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("links to the managed list and uses the correct program page for each publication status", async () => {
    const host = await harness.navigateByUrl(program.launch(programId), HeaderPage);
    const page = harness.routeNativeElement!;
    const back = page.querySelector<HTMLAnchorElement>(".program-heading__back")!;
    expect(back.textContent?.trim()).toBe("Я организую");
    expect(back.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(back.getAttribute("href")).toBe(program.managed());
    const title = page.querySelector<HTMLAnchorElement>("h1 a")!;
    expect(title.getAttribute("href")).toBe(program.preview(programId));
    host.draft.set(false);
    harness.detectChanges();
    expect(title.getAttribute("href")).toBe(program.detail(programId));
    expect(page.querySelector('nav a[aria-current="page"]')?.getAttribute("href")).toBe(
      program.management(programId, "analytics"),
    );
  });

  it("показывает обучение без ссылки на текущий чеклист в черновике и после публикации", async () => {
    await harness.navigateByUrl(program.launch(programId), HeaderPage);
    const dialog = await openHelp();
    expect(
      Array.from(dialog.querySelectorAll("h3")).map(heading => heading.textContent?.trim()),
    ).toEqual(["Участники", "Проекты", "Оценивание", "Настройки"]);
    expect(dialog.textContent).toContain("Поиск · фильтры · выгрузка");
    expect(
      Array.from(dialog.querySelectorAll("article button")).map(button =>
        button.textContent?.trim(),
      ),
    ).toEqual(["Открыть", "Открыть", "Открыть", "Открыть"]);
    click("Закрыть помощь", dialog);
    await vi.waitFor(() => expect(document.body.contains(dialog)).toBe(false));

    const published = await harness.navigateByUrl(
      program.management(programId, "analytics"),
      HeaderPage,
    );
    published.draft.set(false);
    harness.detectChanges();
    const publishedDialog = await openHelp();
    expect(
      Array.from(publishedDialog.querySelectorAll("h3")).map(heading =>
        heading.textContent?.trim(),
      ),
    ).toEqual(["Участники", "Проекты", "Оценивание", "Настройки", "Аналитика"]);
    publishedDialog
      .querySelector<HTMLElement>("button")!
      .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    harness.detectChanges();
    await vi.waitFor(() => expect(document.body.contains(publishedDialog)).toBe(false));
  });

  it("предлагает обучение оцениванию, когда соответствующий раздел доступен", async () => {
    await harness.navigateByUrl(program.management(programId), HeaderPage);
    expect(harness.routeNativeElement!.textContent).toContain("Оценивание");
    const dialog = await openHelp();
    expect(
      Array.from(dialog.querySelectorAll("h3")).map(heading => heading.textContent?.trim()),
    ).toEqual(["Участники", "Проекты", "Оценивание", "Настройки"]);
    click("Открыть обучение «Оценивание»", dialog);
    await vi.waitFor(() => expectCoach("Критерии", "1 из 4"));
  });

  it("uses evaluation routes in order and retains the step when a guard cancels navigation", async () => {
    const host = await harness.navigateByUrl(program.launch(programId), HeaderPage);
    const dialog = await openHelp();
    click("Открыть обучение «Оценивание»", dialog);
    const criteriaUrl = program.management(programId, "settings") + "?tab=criteria";
    await vi.waitFor(() => {
      expect(router.url).toBe(criteriaUrl);
      expectCoach("Критерии", "1 из 4");
    });
    expect(host.canLeave).not.toHaveBeenCalled();

    const activeHost = await harness.navigateByUrl(criteriaUrl, HeaderPage);
    activeHost.canLeave.mockReturnValue(false);
    click("Далее");
    await vi.waitFor(() => expect(activeHost.canLeave).toHaveBeenCalledOnce());
    await vi.waitFor(() => {
      harness.detectChanges();
      expect(
        harness.routeNativeElement!.querySelector(".program-heading__coach button[disabled]"),
      ).toBeNull();
    });
    expect(router.url).toBe(criteriaUrl);
    expectCoach("Критерии", "1 из 4");

    activeHost.canLeave.mockReturnValue(true);
    click("Далее");
    await vi.waitFor(() => {
      expect(router.url).toBe(program.management(programId, "experts"));
      expectCoach("Эксперты", "2 из 4");
    });
    click("Далее");
    await vi.waitFor(() => {
      expect(router.url).toBe(program.management(programId, "projects") + "?tab=allocation");
      expectCoach("Распределение", "3 из 4");
    });
    click("Назад");
    await vi.waitFor(() => expectCoach("Эксперты", "2 из 4"));
    click("Далее");
    await vi.waitFor(() => expectCoach("Распределение", "3 из 4"));
    click("Далее");
    await vi.waitFor(() => {
      expect(router.url).toBe(program.management(programId, "results"));
      expectCoach("Результаты", "4 из 4");
    });

    activeHost.canLeave.mockClear();
    click("Готово");
    expect(harness.routeNativeElement!.querySelector("#program-coach-title")).toBeNull();
    expect(activeHost.canLeave).not.toHaveBeenCalled();
  });

  it("runs and closes the participant tour without discarding the current filters or navigating", async () => {
    const url = program.management(programId) + "?q=Аня";
    const activeHost = await harness.navigateByUrl(url, HeaderPage);
    activeHost.canLeave.mockReturnValue(false);

    click("Открыть обучение «Участники»", await openHelp());
    await vi.waitFor(() => expectCoach("Список участников", "1 из 2"));
    click("Далее");
    expectCoach("Выгрузка участников", "2 из 2");
    click("Закрыть обучение");
    expect(harness.routeNativeElement!.querySelector("#program-coach-title")).toBeNull();
    expect(router.parseUrl(router.url).queryParamMap.get("q")).toBe("Аня");
    expect(activeHost.canLeave).not.toHaveBeenCalled();

    click("Открыть обучение «Участники»", await openHelp());
    await vi.waitFor(() => expectCoach("Список участников", "1 из 2"));
  });

  it("runs the leave guard before opening criteria from another settings tab", async () => {
    const datesUrl = program.management(programId, "settings") + "?tab=dates";
    const activeHost = await harness.navigateByUrl(datesUrl, HeaderPage);
    activeHost.canLeave.mockReturnValue(false);

    click("Открыть обучение «Оценивание»", await openHelp());
    await vi.waitFor(() => expect(activeHost.canLeave).toHaveBeenCalledOnce());
    expect(router.url).toBe(datesUrl);
    expect(harness.routeNativeElement!.querySelector("#program-coach-title")).toBeNull();
  });

  it("проходит настройки по вкладкам и сохраняет текущий шаг при отказе потерять изменения", async () => {
    const base = program.management(programId, "settings");
    const activeHost = await harness.navigateByUrl(base + "?tab=criteria", HeaderPage);
    click("Открыть обучение «Настройки»", await openHelp());
    await vi.waitFor(() => {
      expect(router.url).toBe(base + "?tab=basic");
      expectCoach("Страница", "1 из 6");
    });

    activeHost.canLeave.mockClear().mockReturnValue(false);
    click("Далее");
    await vi.waitFor(() => expect(activeHost.canLeave).toHaveBeenCalledOnce());
    await vi.waitFor(() => {
      harness.detectChanges();
      expect(
        harness.routeNativeElement!.querySelector(".program-heading__coach button[disabled]"),
      ).toBeNull();
    });
    expect(router.url).toBe(base + "?tab=basic");
    expectCoach("Страница", "1 из 6");

    activeHost.canLeave.mockReturnValue(true);
    const steps = [
      ["dates", "Сроки"],
      ["registration", "Регистрация"],
      ["project-form", "Заявка проекта"],
      ["materials", "Материалы"],
      ["organizers", "Организаторы"],
    ];
    for (const [index, [tab, title]] of steps.entries()) {
      click("Далее");
      await vi.waitFor(() => {
        expect(router.url).toBe(base + "?tab=" + tab);
        expectCoach(title, `${index + 2} из 6`);
      });
    }
    click("Назад");
    await vi.waitFor(() => expectCoach("Материалы", "5 из 6"));
    click("Далее");
    await vi.waitFor(() => expectCoach("Организаторы", "6 из 6"));
    activeHost.canLeave.mockClear();
    click("Готово");
    expect(harness.routeNativeElement!.querySelector("#program-coach-title")).toBeNull();
    expect(activeHost.canLeave).not.toHaveBeenCalled();
  });

  it("не покидает открытую страницу настроек без tab и не сбрасывает ее параметры", async () => {
    const url = program.management(programId, "settings") + "?source=launch";
    const activeHost = await harness.navigateByUrl(url, HeaderPage);
    activeHost.canLeave.mockReturnValue(false);
    click("Открыть обучение «Настройки»", await openHelp());
    await vi.waitFor(() => expectCoach("Страница", "1 из 6"));
    expect(router.url).toBe(url);
    expect(activeHost.canLeave).not.toHaveBeenCalled();
  });

  it("не запускает шаг страницы поверх сроков, если переход отменен", async () => {
    const url = program.management(programId, "settings") + "?tab=dates";
    const activeHost = await harness.navigateByUrl(url, HeaderPage);
    activeHost.canLeave.mockReturnValue(false);
    click("Открыть обучение «Настройки»", await openHelp());
    await vi.waitFor(() => expect(activeHost.canLeave).toHaveBeenCalledOnce());
    expect(router.url).toBe(url);
    expect(harness.routeNativeElement!.querySelector("#program-coach-title")).toBeNull();
  });

  it("открывает список проектов из распределения и проходит обучение без сброса фильтров", async () => {
    const base = program.management(programId, "projects");
    const activeHost = await harness.navigateByUrl(base + "?tab=allocation", HeaderPage);
    click("Открыть обучение «Проекты»", await openHelp());
    await vi.waitFor(() => {
      expect(router.url).toBe(base);
      expectCoach("Список проектов", "1 из 4");
    });
    const filtered = base + "?search=Город&case_name=Экология&offset=20";
    await router.navigateByUrl(filtered);
    harness.detectChanges();
    expectCoach("Список проектов", "1 из 4");
    activeHost.canLeave.mockClear().mockReturnValue(false);
    click("Далее");
    expectCoach("Карточка проекта", "2 из 4");
    click("Далее");
    expectCoach("Действия с проектом", "3 из 4");
    click("Далее");
    expectCoach("Выгрузка", "4 из 4");
    click("Готово");
    expect(router.url).toBe(router.serializeUrl(router.parseUrl(filtered)));
    expect(activeHost.canLeave).not.toHaveBeenCalled();
  });

  it("обучает аналитике опубликованной программы без переходов и закрывается при уходе", async () => {
    const url = program.management(programId, "analytics") + "?case_name=Город";
    const activeHost = await harness.navigateByUrl(url, HeaderPage);
    activeHost.draft.set(false);
    harness.detectChanges();
    activeHost.canLeave.mockReturnValue(false);
    click("Открыть обучение «Аналитика»", await openHelp());
    await vi.waitFor(() => expectCoach("Показатели", "1 из 4"));
    click("Далее");
    expectCoach("Требует внимания", "2 из 4");
    click("Далее");
    expectCoach("Воронки и динамика", "3 из 4");
    click("Далее");
    expectCoach("Выгрузка", "4 из 4");
    expect(router.url).toBe(router.serializeUrl(router.parseUrl(url)));
    expect(activeHost.canLeave).not.toHaveBeenCalled();
    activeHost.canLeave.mockReturnValue(true);
    await router.navigateByUrl(program.management(programId, "projects"));
    harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector("#program-coach-title")).toBeNull();
  });
});
