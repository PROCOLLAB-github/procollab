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
      [isCompetitive]="competitive()"
      [active]="'overview'"
    />
    @if (header.activeStep()) {
      <ng-container [ngTemplateOutlet]="header.coachTemplate" />
    }
  `,
})
class HeaderPage {
  readonly programId = programId;
  readonly draft = signal(true);
  readonly competitive = signal(true);
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

  it("opens the existing checklist and removes the action from published help", async () => {
    const host = await harness.navigateByUrl(program.management(programId), HeaderPage);
    const dialog = await openHelp();
    expect(
      Array.from(dialog.querySelectorAll("h3")).map(heading => heading.textContent?.trim()),
    ).toEqual(["Подготовка к запуску", "Участники", "Оценивание"]);
    expect(dialog.textContent).toContain("Поиск · фильтры · выгрузка");
    expect(
      Array.from(dialog.querySelectorAll("article button")).map(button =>
        button.textContent?.trim(),
      ),
    ).toEqual(["Открыть", "Открыть", "Открыть"]);
    click("Открыть чеклист «Подготовка к запуску»", dialog);
    await vi.waitFor(() => expect(router.url).toBe(program.launch(programId)));
    expect(host.canLeave).toHaveBeenCalledOnce();

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
    ).toEqual(["Участники", "Оценивание"]);
    publishedDialog
      .querySelector<HTMLElement>("button")!
      .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    harness.detectChanges();
    await vi.waitFor(() => expect(document.body.contains(publishedDialog)).toBe(false));
  });

  it("не предлагает обучение оцениванию, если оценивание для программы не предусмотрено", async () => {
    const host = await harness.navigateByUrl(program.launch(programId), HeaderPage);
    host.competitive.set(false);
    harness.detectChanges();
    const dialog = await openHelp();
    expect(
      Array.from(dialog.querySelectorAll("h3")).map(heading => heading.textContent?.trim()),
    ).toEqual(["Подготовка к запуску", "Участники"]);
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
    click("Завершить");
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
});
