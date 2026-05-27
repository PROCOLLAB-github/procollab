/** @format */

/**
 * Типизированные билдеры абсолютных путей приложения.
 * Используй вместо хардкод-строк в `router.navigate*`, resolver-ах и фасадах.
 * Шаблоны (`routerLink` в HTML) пока оставлены как есть — они мигрируются отдельно.
 */
export const AppRoutes = {
  office: {
    root: () => "/office",
    feed: () => "/office/feed",
    chats: () => "/office/chats",
    members: () => "/office/members",
    vacancies: () => "/office/vacancies/all",
    vacanciesMy: () => "/office/vacancies/my",
    vacancy: (vacancyId: number | string) => `/office/vacancies/${vacancyId}`,
  },

  auth: {
    login: () => "/auth/login",
    register: () => "/auth/register",
    verifyEmail: () => "/auth/verification/email",
    resetPasswordConfirm: () => "/auth/reset_password/confirm",
    resetPasswordEmail: () => "/auth/reset_password/send_email",
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
    workSection: (projectId: number | string) => `/office/projects/${projectId}/work-section`,
    team: (projectId: number | string) => `/office/projects/${projectId}/team`,
    vacancies: (projectId: number | string) => `/office/projects/${projectId}/vacancies`,
  },

  program: {
    root: () => "/office/program",
    list: () => "/office/program/all",
    detail: (programId: number | string) => `/office/program/${programId}`,
    projects: (programId: number | string) => `/office/program/${programId}/projects`,
    projectsRating: (programId: number | string) => `/office/program/${programId}/projects-rating`,
    members: (programId: number | string) => `/office/program/${programId}/members`,
    register: (programId: number | string) => `/office/program/${programId}/register`,
  },

  chats: {
    detail: (chatId: number | string) => `/office/chats/${chatId}`,
  },

  profile: {
    detail: (userId: number | string) => `/office/profile/${userId}`,
    edit: () => `/office/profile/edit`,
  },

  members: {
    root: () => "/office/members",
  },

  onboarding: {
    root: () => "/office/onboarding",
    stage: (n: number) => `/office/onboarding/stage-${n}`,
  },
} as const;
