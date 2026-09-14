/** @format */

import { describe, expect, it } from "vitest";
import {
  expertWidgetPresentation,
  participantSteps,
  programWidgetRole,
  withoutProjectPresentation,
} from "./program-widget-presentation";
import { Program } from "@domain/program/program.model";
import { ExpertWidget } from "@domain/program/program-role-widget.model";

describe("Program widget presentation", () => {
  it("uses only program roles with organizer/expert/member priority", () => {
    const program = Program.default();
    expect(programWidgetRole(program)).toBeNull();
    program.isUserMember = true;
    expect(programWidgetRole(program)).toBe("participant");
    program.isUserExpert = true;
    expect(programWidgetRole(program)).toBe("expert");
    program.isUserMember = false;
    expect(programWidgetRole(program)).toBe("expert");
    program.isUserManager = true;
    expect(programWidgetRole(program)).toBe("organizer");
  });
  it.each([
    [0, 0, "—", "neutral"],
    [0, 100, "0,0%", "green"],
    [10, 100, "10,0%", "green"],
    [1001, 10000, "10,0%", "yellow"],
    [25, 100, "25,0%", "yellow"],
    [2501, 10000, "25,0%", "red"],
    [19, 248, "7,7%", "green"],
  ])("formats %i/%i before rounding for colour", (count, total, percentage, tone) => {
    expect(
      withoutProjectPresentation({
        participants: Number(total),
        participantsWithoutProject: Number(count),
        projects: 0,
        submittedSolutions: 0,
      }),
    ).toEqual({ percentage, tone, description: `${count} из ${total} участников без проекта` });
  });
  const now = Date.parse("2026-09-01T12:00:00Z");
  const expert: ExpertWidget = {
    mode: "distributed",
    assigned: 7,
    remaining: 3,
    evaluationEnds: null,
  };
  it.each([
    [49 * 3600000, "green", "3 дн"],
    [48 * 3600000, "yellow", "2 дн"],
    [23 * 3600000, "yellow", "23 ч"],
    [59 * 60000, "yellow", "59 мин"],
    [1, "yellow", "1 мин"],
    [0, "red", "Срок оценивания истёк"],
    [-1, "red", "Срок оценивания истёк"],
  ])("handles deadline distance %i", (delta, tone, text) => {
    const result = expertWidgetPresentation(
      { ...expert, evaluationEnds: new Date(now + Number(delta)).toISOString() },
      true,
      now,
    );
    expect(result.tone).toBe(tone);
    expect(result.text).toContain(text);
  });
  it("uses absolute instants across timezones", () =>
    expect(
      expertWidgetPresentation(
        { ...expert, evaluationEnds: "2026-09-01T15:00:00+03:00" },
        true,
        now,
      ).tone,
    ).toBe("red"));
  it("keeps missing deadline neutral", () =>
    expect(expertWidgetPresentation(expert, true, now).text).toBe("Срок не установлен"));
  it("prioritizes no assignments and completion even after deadline", () => {
    const overdue = { ...expert, evaluationEnds: new Date(now - 1000).toISOString() };
    expect(
      expertWidgetPresentation({ ...overdue, assigned: 0, remaining: 0 }, true, now),
    ).toMatchObject({ text: "Нет назначенных проектов", tone: "neutral" });
    expect(expertWidgetPresentation({ ...overdue, remaining: 0 }, true, now)).toMatchObject({
      text: "Все проекты оценены",
      tone: "green",
    });
  });
  it("does not fabricate personal work in open mode", () => {
    const result = expertWidgetPresentation(
      { ...expert, mode: "open", assigned: null, remaining: null },
      true,
      now,
    );
    expect(result.text).toContain("Свободное оценивание");
    expect(result.text).not.toContain("Все проекты оценены");
  });
  it("does not imply mandatory submission in noncompetitive programs", () =>
    expect(expertWidgetPresentation(expert, false, now).text).toBe("Без обязательной сдачи"));
  it("retains open evaluation and its deadline in noncompetitive programs", () => {
    const result = expertWidgetPresentation(
      {
        ...expert,
        mode: "open",
        assigned: null,
        remaining: null,
        evaluationEnds: new Date(now).toISOString(),
      },
      false,
      now,
    );
    expect(result.text).toBe("Свободное оценивание. Срок оценивания истёк");
  });
  it.each(["none", "not_submitted", "not_applicable"] as const)(
    "keeps inactive stages for %s",
    stage =>
      expect(participantSteps(stage).every(step => !step.current && !step.completed)).toBe(true),
  );
  it("distinguishes current and completed stages", () => {
    expect(participantSteps("submitted").map(s => s.completed)).toEqual([false, false, false]);
    expect(participantSteps("review").map(s => s.completed)).toEqual([true, false, false]);
    expect(participantSteps("evaluated").map(s => s.completed)).toEqual([true, true, false]);
    for (const stage of ["submitted", "review", "evaluated"] as const)
      expect(participantSteps(stage).filter(s => s.current && s.completed)).toHaveLength(0);
  });
});
