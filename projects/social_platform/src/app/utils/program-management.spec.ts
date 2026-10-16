/** @format */

import { evaluationLabel, fromMoscowInput, toMoscowInput } from "./program-management";
import { ManagementProject } from "@domain/program/program-management.model";
describe("Отображение управления программой", () => {
  it("не называет частичную оценку завершённой", () => {
    expect(
      evaluationLabel({
        evaluationStatus: "partially_evaluated",
        assignmentsCompleted: 1,
        assignmentsTotal: 2,
      } as ManagementProject),
    ).toBe("Частично · 1/2");
  });
  it("различает несданное решение и отсутствие оценки сданного", () => {
    expect(evaluationLabel({ evaluationStatus: "not_submitted" } as ManagementProject)).toBe("—");
    expect(evaluationLabel({ evaluationStatus: "awaiting_evaluation" } as ManagementProject)).toBe(
      "Не оценено",
    );
  });
  it("использует Москву независимо от часового пояса браузера", () => {
    expect(toMoscowInput("2026-10-17T22:00:00Z")).toBe("2026-10-18T01:00");
    expect(fromMoscowInput("2026-10-18T01:00")).toBe("2026-10-17T22:00:00.000Z");
  });
  it("сохраняет пустой отдельный срок как null для серверного fallback", () => {
    expect(fromMoscowInput("")).toBeNull();
    expect(toMoscowInput(null)).toBe("");
  });
});
