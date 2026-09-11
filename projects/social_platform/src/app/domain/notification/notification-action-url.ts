/** @format */

import { Notification } from "./notification.model";

const LEGACY_VACANCY_RESPONSE_URL = /^\/office\/projects\/\d+\/vacancies\/(\d+)\/responses\/?$/;
const ENCODED_PATH_SEPARATOR = /%(?:2f|5c)/i;

function hasControlCharacters(value: string): boolean {
  return [...value].some(character => {
    const code = character.charCodeAt(0);
    return code <= 31 || code === 127;
  });
}

/**
 * Возвращает только безопасный внутренний Office URL.
 * Единственное legacy-исключение чинит сохранённые vacancy response ссылки.
 */
export function normalizeNotificationActionUrl(notification: Notification): string | null {
  const actionUrl = notification.actionUrl;
  if (!actionUrl) return null;

  if (notification.type === "vacancy_response_created") {
    const legacyMatch = actionUrl.match(LEGACY_VACANCY_RESPONSE_URL);
    if (legacyMatch) return `/office/vacancies/${legacyMatch[1]}`;
  }

  if (!actionUrl.startsWith("/office/")) return null;
  if (actionUrl.includes("\\") || hasControlCharacters(actionUrl)) return null;
  if (ENCODED_PATH_SEPARATOR.test(actionUrl)) return null;

  const path = actionUrl.split(/[?#]/, 1)[0];
  if (path.includes("//")) return null;

  return actionUrl;
}
