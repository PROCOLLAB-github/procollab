/** @format */
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap, provideRouter } from "@angular/router";
import { of, Subject, throwError } from "rxjs";
import { ProgramLaunchUseCase } from "@api/program/use-cases/program-launch.use-case";
import { ProgramManagementUseCase } from "@api/program/use-cases/program-management.use-case";
import { ProgramLaunch } from "@domain/program/program-launch.model";
import { ProgramLaunchComponent } from "./launch.component";

describe("Подготовка программы к запуску", () => {
  const initial = {
    program: { id: 1, name: "Программа", draft: true },
    revision: "version",
    checks: [
      {
        code: "page",
        title: "Страница программы",
        ready: true,
        detail: "Страница заполнена.",
        section: "basic",
      },
      {
        code: "dates",
        title: "Сроки",
        ready: false,
        detail: "Укажите начало и окончание программы.",
        section: "dates",
      },
      {
        code: "registration",
        title: "Регистрация",
        ready: false,
        detail: "Сохраните анкету.",
        section: "registration",
      },
    ],
    blockers: [],
    warnings: [],
    canPublish: false,
    links: { program: "/program/1", registration: null },
  } as ProgramLaunch;

  it("показывает реальные причины и равноправные действия, не позволяя опубликовать черновик раньше времени", () => {
    const params = convertToParamMap({ programId: "1" });
    const query = convertToParamMap({});
    TestBed.configureTestingModule({
      imports: [ProgramLaunchComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(params),
            queryParamMap: of(query),
            snapshot: { queryParamMap: query },
          },
        },
        { provide: ProgramLaunchUseCase, useValue: { readiness: () => of(initial) } },
      ],
    }).overrideComponent(ProgramLaunchComponent, {
      set: {
        providers: [
          {
            provide: ProgramManagementUseCase,
            useValue: { get: () => of({ isCompetitive: true }) },
          },
        ],
      },
    });
    const fixture = TestBed.createComponent(ProgramLaunchComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain("1 из 3 готово");
    expect(host.textContent).toContain("Укажите начало и окончание программы.");
    expect(host.textContent).toContain("Сохраните анкету.");
    const actions = host.querySelectorAll<HTMLAnchorElement>(".launch__check-action a");
    expect(actions).toHaveLength(3);
    expect([...actions].every(action => action.classList.contains("ui-button--secondary"))).toBe(
      true,
    );
    expect(host.querySelector(".launch__actions a")).toBeNull();
    const publish = [...host.querySelectorAll<HTMLButtonElement>(".launch__actions button")].find(
      button => button.textContent?.includes("Опубликовать программу"),
    )!;
    expect(publish.disabled).toBe(true);

    fixture.componentInstance.state.set({
      ...initial,
      checks: initial.checks.map(check => ({ ...check, ready: true })),
      canPublish: true,
    });
    fixture.detectChanges();
    expect(host.textContent).toContain("3 из 3 готово");
    expect(publish.disabled).toBe(false);
  });

  it("не использует устаревший или ошибочный ответ о наличии оценивания", () => {
    const first = new Subject<{ isCompetitive: boolean }>();
    const second = new Subject<{ isCompetitive: boolean }>();
    const get = vi
      .fn()
      .mockReturnValueOnce(first)
      .mockReturnValueOnce(second)
      .mockReturnValueOnce(throwError(() => new Error("Нет доступа")));
    const params = convertToParamMap({ programId: "1" });
    const query = convertToParamMap({});
    TestBed.configureTestingModule({
      imports: [ProgramLaunchComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(params),
            queryParamMap: of(query),
            snapshot: { queryParamMap: query },
          },
        },
        { provide: ProgramLaunchUseCase, useValue: { readiness: () => of(initial) } },
      ],
    }).overrideComponent(ProgramLaunchComponent, {
      set: { providers: [{ provide: ProgramManagementUseCase, useValue: { get } }] },
    });
    const fixture = TestBed.createComponent(ProgramLaunchComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.isCompetitive()).toBeNull();
    fixture.componentInstance.reload();
    second.next({ isCompetitive: false });
    first.next({ isCompetitive: true });
    expect(fixture.componentInstance.isCompetitive()).toBe(false);
    fixture.componentInstance.reload();
    expect(fixture.componentInstance.isCompetitive()).toBeNull();
  });
});
