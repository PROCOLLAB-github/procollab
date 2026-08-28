/** @format */

export type VacancyResponsesLoadError = "forbidden" | "not_found" | "load_error";

function getStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("status" in error)) return undefined;
  return typeof error.status === "number" ? error.status : undefined;
}

function collectMessages(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectMessages);
  if (typeof value !== "object" || value === null) return [];
  return Object.values(value).flatMap(collectMessages);
}

export function getSendVacancyResponseError(error: unknown): string {
  if (getStatus(error) !== 400) {
    return "Не удалось отправить отклик. Попробуйте ещё раз";
  }

  const body = typeof error === "object" && error !== null && "error" in error ? error.error : null;
  const message = collectMessages(body).join(" ").toLocaleLowerCase("ru-RU");

  if (message.includes("уже отклик")) {
    return "Вы уже откликнулись на эту вакансию";
  }
  if (message.includes("участник проекта") || message.includes("состоит в команде")) {
    return "Нельзя откликнуться на вакансию проекта, в котором вы уже участвуете";
  }
  if (message.includes("больше нельзя") || message.includes("закрыт")) {
    return "На эту вакансию больше нельзя откликнуться";
  }

  return "Не удалось отправить отклик. Попробуйте ещё раз";
}

export function getVacancyResponsesLoadError(error: unknown): VacancyResponsesLoadError {
  if (getStatus(error) === 403) return "forbidden";
  if (getStatus(error) === 404) return "not_found";
  return "load_error";
}
