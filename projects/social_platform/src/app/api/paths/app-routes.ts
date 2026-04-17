/** @format */

/**
 * Типизированные билдеры абсолютных путей приложения.
 *
 * Используй вместо хардкод-строк в `router.navigate*`, resolver-ах и фасадах.
 * Шаблоны (`routerLink` в HTML) пока оставлены как есть — они мигрируются отдельно.
 *
 * Правила:
 * - Все пути начинаются со слэша (абсолютные).
 * - Один билдер = одна осмысленная точка навигации, а не "склей сегмент".
 * - Новые разделы добавлять сюда, а не городить строки в фасадах.
 */
export const AppRoutes = {
  office: {
    root: () => "/office",
    feed: () => "/office/feed",
    chats: () => "/office/chats",
    members: () => "/office/members",
    vacancies: () => "/office/vacancies",
  },

  auth: {
    login: () => "/auth/login",
    verifyEmail: () => "/auth/verification/email",
    resetPasswordConfirm: () => "/auth/reset_password/confirm",
  },

  courses: {
    list: () => "/office/courses/all",
    detail: (courseId: number | string) => `/office/courses/${courseId}`,
  },

  projects: {
    all: () => "/office/projects/all",
    my: () => "/office/projects/my",
    detail: (projectId: number | string) => `/office/projects/${projectId}`,
    edit: (projectId: number | string) => `/office/projects/${projectId}/edit`,
    chat: (projectId: number | string) => `/office/projects/${projectId}/chat`,
  },

  program: {
    root: () => "/office/program",
    list: () => "/office/program/all",
    detail: (programId: number | string) => `/office/program/${programId}`,
    register: (programId: number | string) => `/office/program/${programId}/register`,
  },

  chats: {
    detail: (chatId: number | string) => `/office/chats/${chatId}`,
  },

  profile: {
    detail: (userId: number | string) => `/office/profile/${userId}`,
  },

  members: {
    root: () => "/office/members",
  },

  onboarding: {
    root: () => "/office/onboarding",
    stage: (n: number) => `/office/onboarding/stage-${n}`,
  },
} as const;
