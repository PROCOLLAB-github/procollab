/** @format */

import {
  ExpertWidget,
  OrganizerWidget,
  ParticipantStage,
  ProgramWidgetRole,
} from "@domain/program/program-role-widget.model";
import { Program } from "@domain/program/program.model";

export type WidgetTone = "neutral" | "green" | "yellow" | "red";

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
): { text: string; tone: WidgetTone; tooltip: string } {
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
  // Неконкурсная программа не подразумевает сдачу; свободное оценивание остаётся доступным.
  if (!competitive && expert.mode === "distributed")
    return { text: "Без обязательной сдачи", tone: "neutral", tooltip: "" };
  if (expert.mode === "distributed") {
    if (expert.assigned === 0)
      return { text: "Нет назначенных проектов", tone: "neutral", tooltip: "" };
    if (expert.remaining === 0) return { text: "Все проекты оценены", tone: "green", tooltip: "" };
  }
  const prefix = expert.mode === "open" ? "Свободное оценивание. " : "";
  if (!Number.isFinite(deadline))
    return { text: `${prefix}Срок не установлен`, tone: "neutral", tooltip: "" };
  const remaining = deadline - now;
  if (remaining <= 0) return { text: `${prefix}Срок оценивания истёк`, tone: "red", tooltip };
  const duration =
    remaining < 3600000
      ? `${Math.ceil(remaining / 60000)} мин`
      : remaining < 86400000
        ? `${Math.ceil(remaining / 3600000)} ч`
        : `${Math.ceil(remaining / 86400000)} дн`;
  return {
    text: `${prefix}До конца оценивания — ${duration}`,
    tone: remaining <= 48 * 3600000 ? "yellow" : "green",
    tooltip,
  };
}

/** Текущий этап никогда не помечается завершённым; сервер определяет итог проверки. */
export function participantSteps(stage: ParticipantStage) {
  const current = ["submitted", "review", "evaluated"].indexOf(stage);
  return ["Отправлен", "Проверка", "Оценён"].map((label, index) => ({
    label,
    current: current === index,
    completed: index < current,
  }));
}
