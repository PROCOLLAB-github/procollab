/** @format */

import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { RouterTestingHarness } from "@angular/router/testing";
import { ApiService } from "@corelib";
import { of, throwError } from "rxjs";
import { PROGRAM_CONTEXT_GUIDES, PROGRAM_GUIDES } from "./program-guide-content";
import { AppRoutes } from "@api/paths/app-routes";
import { canLeaveManagement } from "@ui/routes/program/management-leave.guard";
import { ProgramManagementHeaderComponent } from "./management-header.component";

const program = AppRoutes.program;
const programId = 12;

@Component({
  imports: [ProgramManagementHeaderComponent],
  template: `
    <app-program-management-header
      [programId]="programId"
      [name]="'Город будущего'"
      [draft]="draft()"
      [active]="active()"
    />
    @if (showContext()) {
      <div role="dialog" aria-modal="true" aria-label="Предпросмотр">
        <div>
          <p data-program-guide="allocation-shortage-v1">Не удалось назначить всех экспертов.</p>
        </div>
      </div>
    }
  `,
})
class HeaderPage {
  readonly programId = programId;
  readonly draft = signal(true);
  readonly active = signal("overview");
  readonly showContext = signal(false);
  readonly canLeave = vi.fn(() => true);
}

describe(ProgramManagementHeaderComponent.name, () => {
  let harness: RouterTestingHarness;
  let router: Router;

  const seen = new Set<string>();
  const api = {
    get: vi.fn(() => of({ seen: [...seen] })),
    post: vi.fn((_url: string, data: { guide: string }) => {
      seen.add(data.guide);
      return of({ seen: [...seen] });
    }),
  };

  beforeEach(async () => {
    seen.clear();
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useValue: api },
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
    expect(page.querySelector("#program-coach-step")?.textContent?.trim()).toBe("Шаг " + step);
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

  it("показывает инструкции запуска только для черновика и сертификаты для организатора", async () => {
    const host = await harness.navigateByUrl(program.launch(programId), HeaderPage);
    const draftDialog = await openHelp();
    expect(draftDialog.textContent).toContain(PROGRAM_GUIDES.find(guide => guide.draftOnly)!.title);
    expect(draftDialog.textContent).toContain("Сертификаты");
    expect(draftDialog.textContent).not.toContain("Аналитика");
    click("Закрыть помощь", draftDialog);
    await vi.waitFor(() => expect(document.body.contains(draftDialog)).toBe(false));
    host.draft.set(false);
    harness.detectChanges();
    const publishedDialog = await openHelp();
    expect(publishedDialog.textContent).toContain("Аналитика");
    expect(publishedDialog.textContent).not.toContain(
      PROGRAM_GUIDES.find(guide => guide.draftOnly)!.title,
    );
  });

  it("открывает подсказку в рабочем диалоге и запоминает ее в аккаунте", async () => {
    let host = await harness.navigateByUrl(program.management(programId, "projects"), HeaderPage);
    expect(harness.routeNativeElement!.querySelector("app-program-guide-overlay")).toBeNull();
    host.showContext.set(true);
    harness.detectChanges();
    const guide = PROGRAM_CONTEXT_GUIDES.find(topic => topic.id === "allocation-shortage-v1")!;
    await vi.waitFor(() => {
      harness.detectChanges();
      expect(
        document.querySelector('[role="dialog"] #program-coach-title')?.textContent?.trim(),
      ).toBe(guide.steps[0].title);
      expect(api.post).toHaveBeenCalledWith("/programs/12/management/help-state/", {
        guide: guide.id,
      });
    });
    click("Закрыть подсказку", document.querySelector('[role="dialog"]')!);
    await harness.navigateByUrl(program.preview(programId), HeaderPage);
    host = await harness.navigateByUrl(program.management(programId, "projects"), HeaderPage);
    host.showContext.set(true);
    harness.detectChanges();
    await vi.waitFor(() => expect(api.get).toHaveBeenCalledTimes(3));
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[role="dialog"] #program-coach-title')).toBeNull();
  });

  it("оставляет ручные инструкции доступными при ошибке чтения отметок", async () => {
    api.get.mockReturnValueOnce(throwError(() => new Error("network")));
    await harness.navigateByUrl(program.management(programId), HeaderPage);
    const dialog = await openHelp();
    expect(dialog.textContent).toContain("Участники");
    expect(api.post).not.toHaveBeenCalled();
  });

  it("открывает критерии и сохраняет шаг при отмене перехода", async () => {
    await harness.navigateByUrl(program.launch(programId), HeaderPage);
    click("Открыть обучение «Оценивание»", await openHelp());
    const guide = PROGRAM_GUIDES.find(topic => topic.title === "Оценивание")!;
    const criteria = program.management(programId, "settings") + "?tab=criteria";
    await vi.waitFor(() => {
      expect(router.url).toBe(criteria);
      expectCoach("Критерии", "1 из " + guide.steps.length);
    });
    const host = await harness.navigateByUrl(criteria, HeaderPage);
    host.canLeave.mockReturnValue(false);
    click("Далее");
    await vi.waitFor(() => expect(host.canLeave).toHaveBeenCalledOnce());
    expect(router.url).toBe(criteria);
    expectCoach("Критерии", "1 из " + guide.steps.length);
  });

  it("повторно открывает ручную инструкцию и сохраняет фильтры", async () => {
    const url = program.management(programId) + "?q=Аня";
    const host = await harness.navigateByUrl(url, HeaderPage);
    host.canLeave.mockReturnValue(false);
    const guide = PROGRAM_GUIDES.find(topic => topic.title === "Участники")!;
    for (let pass = 0; pass < 2; pass++) {
      click("Открыть обучение «Участники»", await openHelp());
      await vi.waitFor(() => expectCoach(guide.steps[0].title, "1 из " + guide.steps.length));
      click("Закрыть подсказку");
    }
    expect(router.parseUrl(router.url).queryParamMap.get("q")).toBe("Аня");
    expect(host.canLeave).not.toHaveBeenCalled();
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
      expect(harness.routeNativeElement!.querySelector(".guide button[disabled]")).toBeNull();
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
    const guide = PROGRAM_GUIDES.find(topic => topic.title === "Проекты")!;
    await vi.waitFor(() => {
      expect(router.url).toBe(base);
      expectCoach(guide.steps[0].title, "1 из " + guide.steps.length);
    });
    const filtered = base + "?search=Город&case_name=Экология&offset=20";
    await router.navigateByUrl(filtered);
    harness.detectChanges();
    expectCoach(guide.steps[0].title, "1 из " + guide.steps.length);
    activeHost.canLeave.mockClear().mockReturnValue(false);
    click("Закрыть подсказку");
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
