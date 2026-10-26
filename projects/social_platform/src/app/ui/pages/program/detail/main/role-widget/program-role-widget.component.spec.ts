/** @format */

import { TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { provideRouter } from "@angular/router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProgramRoleWidgetComponent } from "./program-role-widget.component";
import { ProgramRoleWidgetService } from "@api/program/facades/detail/program-role-widget.service";
import { DetailProgramInfoService } from "@ui/widgets/detail/services/program/detail-program-info.service";
import { AsyncState, failure, loading, success } from "@domain/shared/async-state";
import { ProgramRoleWidget, ProgramWidgetError } from "@domain/program/program-role-widget.model";
import { ProgramDetailMainUIInfoService } from "@api/program/facades/detail/ui/program-detail-main-ui-info.service";
import { Program } from "@domain/program/program.model";

describe("ProgramRoleWidgetComponent", () => {
  const state = signal<AsyncState<ProgramRoleWidget, ProgramWidgetError>>(loading());
  const program = signal<Program>({ ...Program.default(), id: 12 });
  const retry = vi.fn(),
    create = vi.fn();
  const participant: ProgramRoleWidget = {
    role: "participant",
    programId: 12,
    isCompetitive: true,
    participant: {
      participantProject: { id: 5, name: "Длинное название ".repeat(20), programLinkId: 34 },
      caseProvided: true,
      caseName: "Кейс ".repeat(30),
      stage: "review",
      submissionOpen: true,
    },
  };
  beforeEach(async () => {
    retry.mockClear();
    create.mockClear();
    state.set(loading());
    program.set({ ...Program.default(), id: 12 });
    TestBed.configureTestingModule({
      imports: [ProgramRoleWidgetComponent],
      providers: [
        provideRouter([]),
        { provide: ProgramDetailMainUIInfoService, useValue: { program } },
        {
          provide: DetailProgramInfoService,
          useValue: { addNewProject: create, applicationPending: signal(false) },
        },
      ],
    });
    TestBed.overrideComponent(ProgramRoleWidgetComponent, {
      set: {
        providers: [
          { provide: ProgramRoleWidgetService, useValue: { state, retry, programId: signal(12) } },
        ],
      },
    });
    await TestBed.compileComponents();
  });
  function render(data?: ProgramRoleWidget) {
    if (data) state.set(success(data));
    const fixture = TestBed.createComponent(ProgramRoleWidgetComponent);
    fixture.detectChanges();
    return fixture;
  }
  it("shows skeleton without bogus zero counters", () => {
    const f = render();
    expect(f.nativeElement.querySelector(".widget__skeleton")).toBeTruthy();
    expect(f.nativeElement.querySelector("dd")).toBeNull();
  });
  it("uses a real solution reference for both participant links and clears legacy query parameters", () => {
    const f = render(participant);
    state.set(
      success({
        programId: 12,
        storageMode: "solution",
        role: "participant",
        isCompetitive: true,
        participant: {
          application: {
            kind: "solution",
            programId: 12,
            solutionId: 301,
            name: "Решение команды",
          },
          caseProvided: true,
          caseName: "Кейс А",
          stage: "evaluated",
          submissionOpen: false,
        },
      }),
    );
    f.detectChanges();
    const links = f.nativeElement.querySelectorAll("a");
    expect(links).toHaveLength(2);
    for (const link of links)
      expect(link.getAttribute("href")).toBe("/office/program/12/solutions/301");
    expect(f.nativeElement.textContent).toContain("Решение:");
    expect(f.nativeElement.textContent).not.toContain("Проект:");
    expect(f.nativeElement.querySelectorAll(".widget__step--complete")).toHaveLength(3);
    expect(f.nativeElement.querySelector('[aria-label="Этапы решения"]')).toBeTruthy();
    expect(create).not.toHaveBeenCalled();
  });
  it("creates only on the explicit solution action and keeps noncompetitive submission inapplicable", () => {
    const f = render({
      programId: 12,
      storageMode: "solution",
      role: "participant",
      isCompetitive: false,
      participant: {
        application: null,
        caseProvided: false,
        caseName: null,
        stage: "not_applicable",
        submissionOpen: true,
      },
    });
    expect(f.nativeElement.textContent).toContain("Решение не создано");
    expect(f.nativeElement.textContent).toContain("Сдача не предусмотрена");
    expect(create).not.toHaveBeenCalled();
    (f.nativeElement.querySelector("button") as HTMLButtonElement).click();
    expect(create).toHaveBeenCalledExactlyOnceWith(12);
  });
  it("renders distinct solution organizer counters without Project placeholders or false noncompetitive zero", () => {
    const f = render({
      programId: 12,
      storageMode: "solution",
      role: "organizer",
      isCompetitive: false,
      organizer: {
        participants: 5,
        solutions: 2,
        submittedSolutions: null,
        participantsWithoutSolution: 1,
      },
    });
    expect(
      [...f.nativeElement.querySelectorAll("dd")].map((el: HTMLElement) => el.textContent?.trim()),
    ).toEqual(["5", "2", "—", "1"]);
    expect(f.nativeElement.textContent).toContain("Решения");
    expect(f.nativeElement.textContent).toContain("Без команды");
    expect(f.nativeElement.textContent).not.toContain("Проекты");
  });
  it("uses server-owned solution format and expert facts before deadline wording", () => {
    const f = render({
      programId: 12,
      storageMode: "solution",
      role: "expert",
      isCompetitive: true,
      expert: {
        mode: "distributed",
        assigned: 1,
        remaining: 0,
        evaluationEnds: "2000-01-01T00:00:00Z",
      },
    });
    expect(f.nativeElement.textContent).toContain("Все решения оценены");
    expect(f.nativeElement.textContent).not.toContain("Срок оценивания истек");
    expect(f.nativeElement.querySelector("a").getAttribute("href")).toBe(
      "/office/program/12/solutions-rating",
    );
  });
  it("opens the exact project from both name and action and retains full accessible names", () => {
    const f = render(participant);
    const links = f.nativeElement.querySelectorAll("a");
    expect(links).toHaveLength(2);
    for (const link of links)
      expect(link.getAttribute("href")).toBe("/office/projects/5?programLinkId=34");
    expect(links[0].textContent).toContain(participant.participant.participantProject!.name);
    expect(f.nativeElement.querySelector('[aria-current="step"]').textContent).toContain(
      "Проверен",
    );
    expect(f.nativeElement.querySelectorAll(".widget__step--complete")).toHaveLength(2);
  });
  it("does not create or submit automatically and uses existing explicit action", () => {
    const f = render({
      ...participant,
      participant: { ...participant.participant, participantProject: null, stage: "none" },
    });
    expect(create).not.toHaveBeenCalled();
    f.nativeElement.querySelector("button").click();
    expect(create).toHaveBeenCalledWith(12);
  });
  it("renders the server-evaluated project as a completed chain", () => {
    const f = render({
      ...participant,
      participant: { ...participant.participant, stage: "evaluated" },
    });
    expect(f.nativeElement.querySelectorAll(".widget__step--complete")).toHaveLength(3);
    expect(f.nativeElement.querySelector('[aria-current="step"]')).toBeNull();
  });
  it.each([
    ["not_submitted", true, 1, "Отправлен"],
    ["submitted", true, 2, "Проверен"],
    ["none", false, 0, "Создан"],
    ["not_applicable", true, 1, null],
    ["not_applicable", false, 0, "Создан"],
  ] as const)(
    "shows participant milestones for %s (project: %s)",
    (stage, hasProject, completed, current) => {
      const f = render({
        ...participant,
        isCompetitive: stage !== "not_applicable",
        participant: {
          ...participant.participant,
          participantProject: hasProject ? participant.participant.participantProject : null,
          stage,
        },
      });
      const list = f.nativeElement.querySelector(
        '[aria-label="Этапы проекта"]',
      ) as HTMLOListElement;
      expect(
        [...list.querySelectorAll("li > span:last-child")].map(el => el.textContent?.trim()),
      ).toEqual(["Создан", "Отправлен", "Проверен"]);
      expect(list.querySelectorAll(".widget__step--complete")).toHaveLength(completed);
      expect(list.querySelector('[aria-current="step"]')?.textContent ?? null).toEqual(
        current ? expect.stringContaining(current) : null,
      );
      expect(list.textContent).not.toMatch(/Проверка|Оценён/);
      if (stage === "not_applicable")
        expect(f.nativeElement.textContent).toContain("Сдача не предусмотрена");
    },
  );
  it("has no broken action when submission is closed", () => {
    const f = render({
      ...participant,
      participant: {
        ...participant.participant,
        participantProject: null,
        stage: "none",
        submissionOpen: false,
      },
    });
    expect(f.nativeElement.querySelector("button,a")).toBeNull();
    expect(f.nativeElement.textContent).toContain("Срок подачи закрыт");
  });
  it("keeps a draft project link usable after submission closes", () => {
    const f = render({
      ...participant,
      participant: { ...participant.participant, stage: "not_submitted", submissionOpen: false },
    });
    expect(f.nativeElement.textContent).toContain("Не отправлен");
    expect(f.nativeElement.querySelectorAll("a")).toHaveLength(2);
  });
  it("shows four organizer counts without a standalone percentage", () => {
    const f = render({
      role: "organizer",
      programId: 12,
      isCompetitive: true,
      organizer: {
        participants: 248,
        projects: 61,
        submittedSolutions: 54,
        participantsWithoutProject: 19,
      },
    });
    expect(f.nativeElement.querySelectorAll("dd")).toHaveLength(4);
    expect(f.nativeElement.textContent).not.toContain("%");
    expect(
      [...f.nativeElement.querySelectorAll("dd")].map((el: HTMLElement) => el.textContent?.trim()),
    ).toEqual(["248", "61", "54", "19"]);
    expect(f.nativeElement.querySelector("a").getAttribute("href")).toBe(
      "/office/program/12/management/analytics",
    );
  });
  it("shows only two expert counters and the real evaluation route", () => {
    const f = render({
      role: "expert",
      programId: 12,
      isCompetitive: true,
      expert: {
        mode: "distributed",
        assigned: 0,
        remaining: 0,
        evaluationEnds: "2020-01-01T00:00:00Z",
      },
    });
    expect(f.nativeElement.querySelectorAll("dd")).toHaveLength(2);
    expect(f.nativeElement.textContent).toContain("Нет назначенных проектов");
    expect(f.nativeElement.querySelector("a").getAttribute("href")).toBe(
      "/office/program/12/projects-rating",
    );
  });
  it("opens solution evaluation only for the explicit solution program format", () => {
    program.update(value => ({ ...value, solutionStorageMode: "solution" }));
    const f = render({
      role: "expert",
      programId: 12,
      isCompetitive: true,
      expert: { mode: "distributed", assigned: 1, remaining: 1, evaluationEnds: null },
    });
    expect(f.nativeElement.querySelector("a").getAttribute("href")).toBe(
      "/office/program/12/solutions-rating",
    );
    program.update(value => ({ ...value, solutionStorageMode: "legacy_project" }));
    f.detectChanges();
    expect(f.nativeElement.querySelector("a").getAttribute("href")).toBe(
      "/office/program/12/projects-rating",
    );
  });
  it("renders open counters as inapplicable", () => {
    const f = render({
      role: "expert",
      programId: 12,
      isCompetitive: true,
      expert: { mode: "open", assigned: null, remaining: null, evaluationEnds: null },
    });
    expect(
      [...f.nativeElement.querySelectorAll("dd")].map((e: any) => e.textContent.trim()),
    ).toEqual(["—", "—"]);
    expect(f.nativeElement.textContent).toContain("Свободное оценивание");
  });
  it("updates across the deadline and releases its local clock on destroy", () => {
    vi.useFakeTimers();
    const now = Date.parse("2026-09-01T12:00:00Z");
    vi.setSystemTime(now);
    try {
      const f = render({
        role: "expert",
        programId: 12,
        isCompetitive: true,
        expert: {
          mode: "distributed",
          assigned: 1,
          remaining: 1,
          evaluationEnds: new Date(now + 1000).toISOString(),
        },
      });
      expect(f.nativeElement.textContent).toContain("1 мин");
      vi.advanceTimersByTime(1000);
      f.detectChanges();
      expect(f.nativeElement.textContent).toContain("Срок оценивания истек");
      const lastTick = f.componentInstance.now();
      f.destroy();
      vi.advanceTimersByTime(1000);
      expect(f.componentInstance.now()).toBe(lastTick);
    } finally {
      vi.useRealTimers();
    }
  });
  it("retries only network failure and never displays raw body", () => {
    state.set(failure("network"));
    const f = render();
    expect(f.nativeElement.textContent).toContain("Не удалось загрузить");
    f.nativeElement.querySelector("button").click();
    expect(retry).toHaveBeenCalledOnce();
    state.set(failure("forbidden"));
    f.detectChanges();
    expect(f.nativeElement.querySelector("button")).toBeNull();
    expect(f.nativeElement.textContent).toContain("Нет доступа");
  });
});
