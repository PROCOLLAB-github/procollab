/** @format */

import { programDeadlines, ProgramScheduleDates } from "./program-deadlines";

describe("programDeadlines", () => {
  const now = new Date(2026, 9, 14, 12, 0);
  const at = (day: number, hour = 18, minute = 0) =>
    new Date(2026, 9, day, hour, minute).toISOString();
  const dates: ProgramScheduleDates = {
    datetimeRegistrationEnds: at(13),
    datetimeProjectSubmissionEnds: at(17),
    datetimeEvaluationEnds: at(24),
  };

  it("highlights the current stage in workflow order even when later deadlines are out of order", () => {
    const rows = programDeadlines({ ...dates, datetimeEvaluationEnds: at(16) }, true, now);
    expect(rows.map(row => row.key)).toEqual(["registration", "submission", "evaluation"]);
    expect(rows.map(row => row.status)).toEqual([
      "Срок завершен",
      "Осталось 3 дня",
      "Осталось 2 дня",
    ]);
    expect(rows.filter(row => row.active).map(row => row.key)).toEqual(["submission"]);
    expect(rows.map(row => row.label)).toEqual(["Регистрация", "Идет прием решений", "Оценивание"]);
    expect(rows[0].ended).toBe(true);
    expect(rows[1].datetime).toBe(at(17));
    expect(rows[1].dateLabel).toContain("17.10.2026");
    expect(rows[1].dateLabel).toContain("18:00");
  });

  it.each([
    [at(14, 11, 59), "Срок завершен", true],
    [at(14, 12), "Сегодня", false],
    [at(14, 23, 59), "Сегодня", false],
    [at(15, 0), "Завтра", false],
  ])("uses the exact timestamp before calendar-day labels: %s", (datetime, status, ended) => {
    const row = programDeadlines({ datetimeRegistrationEnds: datetime }, false, now)[0];
    expect(row.status).toBe(status);
    expect(row.ended).toBe(ended);
    expect(row.active).toBe(!ended);
  });

  it.each([
    [21, "Остался 21 день"],
    [22, "Осталось 22 дня"],
    [25, "Осталось 25 дней"],
    [11, "Осталось 11 дней"],
  ])("uses Russian day plurals for %s calendar days", (days, status) => {
    const datetime = new Date(2026, 9, 14 + days, 18).toISOString();
    expect(programDeadlines({ datetimeEvaluationEnds: datetime }, false, now)[0].status).toBe(
      status,
    );
  });

  it.each([null, undefined, "", "   "])(
    "uses the API registration fallback for an absent submission deadline %s",
    missing => {
      const rows = programDeadlines(
        { ...dates, datetimeProjectSubmissionEnds: missing },
        true,
        now,
      );
      expect(rows[1].datetime).toBe(rows[0].datetime);
      expect(rows[1].usesRegistrationDeadline).toBe(true);
      expect(rows[1].status).toBe("Срок завершен");
    },
  );

  it("highlights only registration when submission uses the same deadline", () => {
    const rows = programDeadlines({ datetimeRegistrationEnds: at(15) }, true, now);
    expect(rows.map(row => row.active)).toEqual([true, false]);
    expect(rows.map(row => row.label)).toEqual(["Идет регистрация", "Прием решений"]);
    expect(rows.map(row => row.key)).toEqual(["registration", "submission"]);
  });

  it("hides the submission stage when submission is not applicable", () => {
    const rows = programDeadlines(dates, false, now);
    expect(rows.map(row => row.key)).toEqual(["registration", "evaluation"]);
    expect(rows[1].active).toBe(true);
    expect(rows[1].label).toBe("Идет оценивание");
  });

  it("skips missing and invalid dates without inventing an evaluation or replacing an invalid explicit date", () => {
    expect(programDeadlines(null, true, now)).toEqual([]);
    expect(programDeadlines({}, true, now)).toEqual([]);
    expect(
      programDeadlines({ datetimeRegistrationEnds: "bad", datetimeEvaluationEnds: " " }, true, now),
    ).toEqual([]);
    const rows = programDeadlines({ ...dates, datetimeProjectSubmissionEnds: "bad" }, true, now);
    expect(rows.map(row => row.key)).toEqual(["registration", "evaluation"]);
  });

  it("does not highlight any deadline when all are past", () => {
    const rows = programDeadlines(dates, true, new Date(2026, 10, 1));
    expect(rows.every(row => row.ended && !row.active)).toBe(true);
    expect(rows.map(row => row.label)).toEqual(["Регистрация", "Прием решений", "Оценивание"]);
  });

  it("advances the active stage and uses the present tense as deadlines pass", () => {
    const dates = {
      datetimeRegistrationEnds: at(15),
      datetimeProjectSubmissionEnds: at(17),
      datetimeEvaluationEnds: at(24),
    };
    for (const [day, key, label] of [
      [14, "registration", "Идет регистрация"],
      [16, "submission", "Идет прием решений"],
      [18, "evaluation", "Идет оценивание"],
    ] as const) {
      const rows = programDeadlines(dates, true, new Date(2026, 9, day, 12));
      const active = rows.filter(row => row.active);
      expect(active).toHaveLength(1);
      expect(active[0].key).toBe(key);
      expect(active[0].label).toBe(label);
    }
  });
});
