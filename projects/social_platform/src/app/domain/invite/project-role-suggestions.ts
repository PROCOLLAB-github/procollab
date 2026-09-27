/** @format */

/** Подсказки не ограничивают свободный ввод роли. */
export const PROJECT_ROLE_SUGGESTIONS = [
  "Project Manager",
  "Product Manager",
  "Backend-разработчик",
  "Frontend-разработчик",
  "Fullstack-разработчик",
  "UI/UX-дизайнер",
  "Бизнес-аналитик",
  "Аналитик",
  "Data Analyst",
  "QA / тестировщик",
  "Маркетолог",
  "Исследователь",
  "ML-разработчик",
] as const;

export function normalizeInviteText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function filterProjectRoles(query: string): readonly string[] {
  const normalized = normalizeInviteText(query).toLocaleLowerCase();
  return PROJECT_ROLE_SUGGESTIONS.filter(role =>
    (role === "Data Analyst" ? role + " аналитик данных" : role)
      .toLocaleLowerCase()
      .includes(normalized),
  );
}
