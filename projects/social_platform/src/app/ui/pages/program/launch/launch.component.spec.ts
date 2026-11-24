/** @format */
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap, provideRouter } from "@angular/router";
import { BehaviorSubject, of, Subject } from "rxjs";
import { ProgramLaunchUseCase } from "@api/program/use-cases/program-launch.use-case";
import { ProgramLaunch } from "@domain/program/program-launch.model";
import { ApiService } from "@corelib";
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
    const readiness = new BehaviorSubject(initial);
    TestBed.configureTestingModule({
      imports: [ProgramLaunchComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: { get: () => of({ seen: [] }) } },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(params),
            queryParamMap: of(query),
            snapshot: { queryParamMap: query },
          },
        },
        { provide: ProgramLaunchUseCase, useValue: { readiness: () => readiness } },
      ],
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

    readiness.next({
      ...initial,
      checks: initial.checks.map(check => ({ ...check, ready: true })),
      canPublish: true,
    });
    fixture.detectChanges();
    expect(host.textContent).toContain("3 из 3 готово");
    expect(publish.disabled).toBe(false);

    const ready = fixture.componentInstance.state()!;
    const caseCheck = {
      code: "cases",
      title: "Кейсы программы",
      ready: false,
      detail: "Добавьте и сохраните хотя бы один кейс.",
      section: "project-form",
    } as const;
    const blocked: ProgramLaunch = {
      ...ready,
      program: { ...ready.program, programFormat: "case_championship" },
      checks: [...ready.checks, caseCheck],
      blockers: [caseCheck],
      canPublish: false,
    };
    readiness.next(blocked);
    fixture.detectChanges();
    const caseLink = host.querySelector<HTMLAnchorElement>(
      '[aria-label="Добавить кейсы в заявке проекта"]',
    )!;
    const queryParams = new URL(caseLink.href).searchParams;
    expect(queryParams.get("tab")).toBe("project-form");
    expect(queryParams.get("return")).toBe("launch");
    expect(host.textContent).toContain(caseCheck.detail);
    expect(host.textContent).toContain("3 из 4 готово");
    expect(publish.disabled).toBe(true);

    readiness.next({
      ...blocked,
      checks: [...ready.checks, { ...caseCheck, ready: true }],
      blockers: [],
      canPublish: true,
    });
    fixture.detectChanges();
    expect(host.textContent).toContain("4 из 4 готово");
    expect(publish.disabled).toBe(false);
  });

  it("не заменяет свежие данные подготовки ответом устаревшего запроса", () => {
    const first = new Subject<ProgramLaunch>();
    const second = new Subject<ProgramLaunch>();
    const readiness = vi.fn().mockReturnValueOnce(first).mockReturnValueOnce(second);
    const params = convertToParamMap({ programId: "1" });
    const query = convertToParamMap({});
    TestBed.configureTestingModule({
      imports: [ProgramLaunchComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: { get: () => of({ seen: [] }) } },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(params),
            queryParamMap: of(query),
            snapshot: { queryParamMap: query },
          },
        },
        { provide: ProgramLaunchUseCase, useValue: { readiness } },
      ],
    });
    const fixture = TestBed.createComponent(ProgramLaunchComponent);
    fixture.detectChanges();
    fixture.componentInstance.reload();
    second.next(initial);
    first.next({ ...initial, program: { ...initial.program, name: "Устаревшие данные" } });
    expect(fixture.componentInstance.state()?.program.name).toBe("Программа");
  });
});
