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

describe("ProgramRoleWidgetComponent", () => {
  const state = signal<AsyncState<ProgramRoleWidget, ProgramWidgetError>>(loading());
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
    TestBed.configureTestingModule({
      imports: [ProgramRoleWidgetComponent],
      providers: [
        provideRouter([]),
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
  it("opens the exact project from both name and action and retains full accessible names", () => {
    const f = render(participant);
    const links = f.nativeElement.querySelectorAll("a");
    expect(links).toHaveLength(2);
    for (const link of links)
      expect(link.getAttribute("href")).toBe("/office/projects/5?programLinkId=34");
    expect(links[0].textContent).toContain(participant.participant.participantProject!.name);
    expect(f.nativeElement.querySelector('[aria-current="step"]').textContent).toContain(
      "Проверка",
    );
    expect(f.nativeElement.querySelectorAll(".widget__step--complete")).toHaveLength(1);
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
  it("shows four organizer counters and one inline percentage", () => {
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
    expect(f.nativeElement.textContent).toContain("7,7%");
    expect(f.nativeElement.querySelector("a").getAttribute("href")).toBe(
      "/office/program/12/analytics",
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
      expect(f.nativeElement.textContent).toContain("Срок оценивания истёк");
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
