/** @format */

import { normalizeNotificationActionUrl } from "./notification-action-url";
import { Notification } from "./notification.model";

function notification(actionUrl: string | null, type = "program_news_published"): Notification {
  return {
    id: 1,
    type,
    category: "program",
    title: "Заголовок",
    message: "Сообщение",
    actionUrl,
    readAt: null,
    createdAt: "2026-09-12T08:00:00Z",
    actor: null,
  };
}

describe("normalizeNotificationActionUrl", () => {
  it.each([
    "/office/program/12",
    "/office/projects/invites?source=notification",
    "/office/courses/7#lesson",
  ])("разрешает внутренний Office URL %s", actionUrl => {
    expect(normalizeNotificationActionUrl(notification(actionUrl))).toBe(actionUrl);
  });

  it.each([
    null,
    "",
    "//evil.example/path",
    "https://evil.example/office/program/12",
    "http://evil.example",
    "javascript:alert(1)",
    "/auth/login",
    "/office\\program\\12",
    "/office//evil.example",
    "/office/%2F%2Fevil.example",
  ])("отклоняет внешний или malformed URL %s", actionUrl => {
    expect(normalizeNotificationActionUrl(notification(actionUrl))).toBeNull();
  });

  it("нормализует только документированный legacy vacancy response URL", () => {
    const legacy = notification(
      "/office/projects/42/vacancies/77/responses/",
      "vacancy_response_created",
    );

    expect(normalizeNotificationActionUrl(legacy)).toBe("/office/vacancies/77");
  });

  it("не угадывает legacy URL для другого notification type", () => {
    const legacy = notification(
      "/office/projects/42/vacancies/77/responses",
      "vacancy_response_accepted",
    );

    expect(normalizeNotificationActionUrl(legacy)).toBe(
      "/office/projects/42/vacancies/77/responses",
    );
  });
});
