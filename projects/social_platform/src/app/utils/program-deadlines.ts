/** @format */

export interface ProgramScheduleDates {
  datetimeRegistrationEnds?: string | null;
  datetimeProjectSubmissionEnds?: string | null;
  datetimeEvaluationEnds?: string | null;
}

export interface ProgramDeadline {
  key: "registration" | "submission" | "evaluation";
  label: string;
  datetime: string;
  dateLabel: string;
  status: string;
  ended: boolean;
  active: boolean;
  usesRegistrationDeadline: boolean;
}

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const plural = new Intl.PluralRules("ru-RU");

/** Local calendar days, without assuming every day is exactly 24 hours long. */
function calendarDay(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;
}

function deadlineStatus(date: Date, now: Date): string {
  if (date.getTime() < now.getTime()) return "Срок завершён";
  const days = calendarDay(date) - calendarDay(now);
  if (days === 0) return "Сегодня";
  if (days === 1) return "Завтра";
  const form = plural.select(days);
  const word = form === "one" ? "день" : form === "few" ? "дня" : "дней";
  return `${form === "one" ? "Остался" : "Осталось"} ${days} ${word}`;
}

export function programDeadlines(
  dates: ProgramScheduleDates | null,
  submissionApplicable: boolean,
  now: Date,
): ProgramDeadline[] {
  if (!dates) return [];
  const explicitSubmission = dates.datetimeProjectSubmissionEnds?.trim();
  const stages = [
    {
      key: "registration" as const,
      label: "Регистрация",
      activeLabel: "Идёт регистрация",
      datetime: dates.datetimeRegistrationEnds,
      applicable: true,
      usesRegistrationDeadline: false,
    },
    {
      key: "submission" as const,
      label: "Приём решений",
      activeLabel: "Идёт приём решений",
      // Matches PartnerProgram.get_project_submission_deadline() on the API.
      datetime: explicitSubmission || dates.datetimeRegistrationEnds,
      applicable: submissionApplicable,
      usesRegistrationDeadline: !explicitSubmission,
    },
    {
      key: "evaluation" as const,
      label: "Оценивание",
      activeLabel: "Идёт оценивание",
      datetime: dates.datetimeEvaluationEnds,
      applicable: true,
      usesRegistrationDeadline: false,
    },
  ];
  const valid = stages.flatMap(stage => {
    if (!stage.applicable || !stage.datetime?.trim()) return [];
    const date = new Date(stage.datetime);
    if (!Number.isFinite(date.getTime())) return [];
    return [{ ...stage, date }];
  });
  const active = valid.find(stage => stage.date.getTime() >= now.getTime());

  return valid.map(stage => ({
    key: stage.key,
    label: stage === active ? stage.activeLabel : stage.label,
    datetime: stage.date.toISOString(),
    dateLabel: dateFormat.format(stage.date),
    status: deadlineStatus(stage.date, now),
    ended: stage.date.getTime() < now.getTime(),
    active: stage === active,
    usesRegistrationDeadline: stage.usesRegistrationDeadline,
  }));
}
