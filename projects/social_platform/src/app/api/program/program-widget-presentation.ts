/** @format */

import {
  ExpertWidget,
  OrganizerWidget,
  ParticipantStage,
  ProgramWidgetRole,
} from "@domain/program/program-role-widget.model";
import { Program } from "@domain/program/program.model";

export type WidgetTone = "neutral" | "green" | "yellow" | "red";

export interface ExpertWidgetStatus {
  label: string | null;
  value: string;
  text: string;
  countdown: boolean;
  tone: WidgetTone;
  tooltip: string;
}

/** Полные единицы времени остаются видимыми; склонение учитывает 11–14 и 21/22. */
function durationText(count: number, forms: [string, string, string]): string {
  const plural = new Intl.PluralRules("ru-RU").select(count);
  return `${count} ${forms[plural === "one" ? 0 : plural === "few" ? 1 : 2]}`;
}

/** Только контекстные флаги; глобальная роль пользователя и наличие назначений не подходят. */
export function programWidgetRole(program: Program | undefined): ProgramWidgetRole | null {
  return program?.isUserManager
    ? "organizer"
    : program?.isUserExpert
      ? "expert"
      : program?.isUserMember
        ? "participant"
        : null;
}

/** Цвет рассчитывается до округления. Нулевой знаменатель — неприменимая доля. */
export function withoutProjectPresentation(metrics: OrganizerWidget) {
  const { participants: total, participantsWithoutProject: count } = metrics;
  const percentage = total > 0 ? (count / total) * 100 : null;
  const tone: WidgetTone =
    percentage === null
      ? "neutral"
      : percentage <= 10
        ? "green"
        : percentage <= 25
          ? "yellow"
          : "red";
  return {
    tone,
    percentage: percentage === null ? "—" : `${percentage.toFixed(1).replace(".", ",")}%`,
    description: `${count} из ${total} участников без проекта`,
  };
}

/** Состояния работы имеют приоритет над дедлайном; open не создаёт персональный остаток. */
export function expertWidgetPresentation(
  expert: ExpertWidget,
  competitive: boolean,
  now: number,
): ExpertWidgetStatus {
  const deadline = expert.evaluationEnds ? Date.parse(expert.evaluationEnds) : NaN;
  const tooltip = Number.isFinite(deadline)
    ? new Intl.DateTimeFormat("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(deadline)
    : "";
  const modeLabel = expert.mode === "open" ? "Свободное оценивание" : null;
  const status = (
    value: string,
    tone: WidgetTone,
    date = "",
    label = modeLabel,
    countdown = false,
  ): ExpertWidgetStatus => ({
    label,
    value,
    text: label ? `${label}. ${value}` : value,
    tone,
    tooltip: date,
    countdown,
  });
  // Неконкурсная программа не подразумевает сдачу; свободное оценивание остаётся доступным.
  if (!competitive && expert.mode === "distributed")
    return status("Без обязательной сдачи", "neutral");
  if (expert.mode === "distributed") {
    if (expert.assigned === 0) return status("Нет назначенных проектов", "neutral");
    if (expert.remaining === 0) return status("Все проекты оценены", "green");
  }
  if (!Number.isFinite(deadline)) return status("Срок не установлен", "neutral");
  const remaining = deadline - now;
  if (remaining <= 0) return status("Срок оценивания истёк", "red", tooltip);
  const duration =
    remaining < 3600000
      ? durationText(Math.ceil(remaining / 60000), ["минута", "минуты", "минут"])
      : remaining < 86400000
        ? durationText(Math.ceil(remaining / 3600000), ["час", "часа", "часов"])
        : durationText(Math.ceil(remaining / 86400000), ["день", "дня", "дней"]);
  return status(
    modeLabel ? `Осталось ${duration}` : duration,
    remaining <= 48 * 3600000 ? "yellow" : "green",
    tooltip,
    modeLabel ?? "До конца оценивания",
    true,
  );
}

/** Проверка остаётся текущей без галочки; серверный evaluated завершает всю цепочку. */
export function participantSteps(stage: ParticipantStage) {
  const current = ["submitted", "review", "evaluated"].indexOf(stage);
  return ["Отправлен", "Проверка", "Оценён"].map((label, index) => ({
    label,
    current: stage !== "evaluated" && current === index,
    completed: stage === "evaluated" || index < current,
  }));
}
