/** @format */
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { RouterTestingHarness } from "@angular/router/testing";
import { of, Subject } from "rxjs";
import { ok, fail } from "@domain/shared/result.type";
import { solutionContractScenarios } from "@domain/solution/solution-contract.fixture";
import {
  SolutionPublishedSolution,
  SolutionPublishedSolutionPage,
} from "@domain/solution/solution-contract.model";
import {
  GetPublishedSolutionUseCase,
  GetPublishedSolutionsUseCase,
} from "@api/solution/use-cases/solution-publication.use-cases";
import { PublishedSolutionsComponent } from "./published-solutions.component";

const list = solutionContractScenarios.find(s => s.name === "published_solutions_list")!
  .response as SolutionPublishedSolutionPage;
const detail = solutionContractScenarios.find(s => s.name === "published_solution_zero_false_file")!
  .response as SolutionPublishedSolution;
describe("Публичные решения внутри программы", () => {
  const getList = { execute: vi.fn() },
    getDetail = { execute: vi.fn() };
  beforeEach(() => {
    getList.execute.mockReset().mockReturnValue(of(ok(structuredClone(list))));
    getDetail.execute.mockReset().mockReturnValue(of(ok(structuredClone(detail))));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: "office/program/:programId",
            children: [
              { path: "published-solutions", component: PublishedSolutionsComponent },
              { path: "published-solutions/:solutionId", component: PublishedSolutionsComponent },
            ],
          },
        ]),
        { provide: GetPublishedSolutionsUseCase, useValue: getList },
        { provide: GetPublishedSolutionUseCase, useValue: getDetail },
      ],
    });
  });
  it("строит только публичные ссылки решения и переносит поиск/страницу в карточку", async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(
      "/office/program/14/published-solutions?q=Прототип&offset=20",
      PublishedSolutionsComponent,
    );
    expect(getList.execute).toHaveBeenCalledExactlyOnceWith(14, {
      search: "Прототип",
      offset: 20,
      limit: 20,
    });
    const links = Array.from(
      harness.routeNativeElement!.querySelectorAll<HTMLAnchorElement>(".published__list a"),
    );
    expect(links.length).toBe(list.results.length);
    expect(links.every(a => a.getAttribute("href")?.includes("/published-solutions/"))).toBe(true);
    expect(links[0].getAttribute("href")).toContain("offset=20");
    expect(harness.routeNativeElement!.querySelector('a[href*="/projects/"]')).toBeNull();
    expect(getDetail.execute).not.toHaveBeenCalled();
  });
  it("показывает 0/Нет/файл, а Команда остается второй вкладкой без повторного GET", async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(
      "/office/program/14/published-solutions/501?q=Прототип&offset=20",
      PublishedSolutionsComponent,
    );
    const values = Array.from(harness.routeNativeElement!.querySelectorAll(".answer")).map(el =>
      el.textContent?.trim(),
    );
    expect(values).toContain("0");
    expect(values).toContain("Нет");
    expect(harness.routeNativeElement!.querySelector('a[target="_blank"]')).not.toBeNull();
    const tabs = Array.from(harness.routeNativeElement!.querySelectorAll("nav a"));
    expect(tabs.map(a => a.textContent?.trim())).toEqual(["Решение", "Команда"]);
    await harness.navigateByUrl(
      "/office/program/14/published-solutions/501?q=Прототип&offset=20&tab=team",
      PublishedSolutionsComponent,
    );
    expect(component.teamTab()).toBe(true);
    expect(getDetail.execute).toHaveBeenCalledTimes(1);
    expect(harness.routeNativeElement!.querySelectorAll(".published__team li").length).toBe(
      detail.team.acceptedCount,
    );
    const back = harness.routeNativeElement!.querySelector<HTMLAnchorElement>("section > a")!;
    expect(back.getAttribute("href")).toContain("published-solutions?");
    expect(back.getAttribute("href")).toContain("offset=20");
  });
  it("очищает прошлую публикацию при смене программы и игнорирует запоздалый ответ", async () => {
    const old = new Subject<ReturnType<typeof ok<SolutionPublishedSolution>>>();
    getDetail.execute.mockReturnValueOnce(old);
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(
      "/office/program/14/published-solutions/501",
      PublishedSolutionsComponent,
    );
    await harness.navigateByUrl(
      "/office/program/15/published-solutions/502",
      PublishedSolutionsComponent,
    );
    old.next(ok({ ...detail, application: { ...detail.application, name: "Старая публикация" } }));
    old.complete();
    expect(component.programId()).toBe(15);
    expect(harness.routeNativeElement!.textContent).not.toContain("Старая публикация");
    expect(getDetail.execute).toHaveBeenLastCalledWith(15, 502);
  });
  it("не использует приватный редактор как fallback, если публикация недоступна", async () => {
    getDetail.execute.mockReturnValue(
      of(fail({ code: "not_found", detail: "Не найдено", errors: [], meta: {} })),
    );
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(
      "/office/program/14/published-solutions/501",
      PublishedSolutionsComponent,
    );
    expect(component.solution()).toBeNull();
    expect(harness.routeNativeElement!.textContent).toContain("еще не опубликовано");
    expect(getList.execute).not.toHaveBeenCalled();
    expect(TestBed.inject(Router).url).toBe("/office/program/14/published-solutions/501");
  });
  it("оставляет поле поиска на месте при загрузке и позволяет повторить ошибочный запрос", async () => {
    const loading = new Subject<ReturnType<typeof ok<SolutionPublishedSolutionPage>>>();
    getList.execute.mockReturnValueOnce(loading);
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl(
      "/office/program/14/published-solutions?q=Текст",
      PublishedSolutionsComponent,
    );
    const input =
      harness.routeNativeElement!.querySelector<HTMLInputElement>('input[type="search"]');
    expect(input?.value).toBe("Текст");
    loading.next(ok(list));
    loading.complete();
    harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('input[type="search"]')).toBe(input);
    component.reload();
    expect(getList.execute).toHaveBeenCalledTimes(2);
  });
  it("не отправляет некорректные ID в API", async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(
      "/office/program/14/published-solutions/NaN",
      PublishedSolutionsComponent,
    );
    expect(getDetail.execute).not.toHaveBeenCalled();
    expect(getList.execute).not.toHaveBeenCalled();
    expect(harness.routeNativeElement!.textContent).toContain("недоступно");
  });
});
