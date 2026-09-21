/** @format */

import { PartnerProgramInfo, Project } from "@domain/project/project.model";

/** Связь из list-контракта: имя программы для отображения статуса не требуется. */
export function projectCardProgram(isSubmitted: boolean): PartnerProgramInfo {
  return {
    id: 12,
    programId: 12,
    programLinkId: 120,
    isSubmitted,
    canSubmit: !isSubmitted,
    programFields: [],
    programFieldValues: [],
  };
}

/** Полная модель исключает зависимость UI-тестов от случайно пропущенных полей API. */
export function projectCardFixture(overrides: Partial<Project> = {}): Project {
  return {
    ...Project.default(),
    id: 101,
    leader: 7,
    name: "Кейс для Ростовской области",
    shortDescription: "Проект для комфортной жизни и совместной работы студентов.",
    imageAddress: "/assets/images/projects/shared/idea.svg",
    industry: 1,
    ...overrides,
  };
}

/** Lifecycle и роль проверяются на одних данных в component tests и visual smoke. */
export const myProjectCardFixtures = [
  {
    key: "draft",
    label: "Черновик",
    action: "Продолжить",
    role: "Лидер",
    access: "можно редактировать",
    canEdit: true,
    project: projectCardFixture({
      id: 101,
      draft: true,
      name: "Тестирование пути пользователя",
      shortDescription: "Удобный сервис для организации учебного процесса и студенческой жизни.",
    }),
  },
  {
    key: "published",
    label: "Опубликован",
    action: "Редактировать",
    role: "Лидер",
    access: "можно редактировать",
    canEdit: true,
    project: projectCardFixture({
      id: 102,
      name: "Тест ленты",
      shortDescription: "Инициативы для более экологичного и комфортного университета.",
    }),
  },
  {
    key: "program",
    label: "В программе",
    action: "Редактировать",
    role: "Лидер",
    access: "можно редактировать",
    canEdit: true,
    project: projectCardFixture({
      id: 103,
      name: "TEST VALIDATION",
      shortDescription: "Интеллектуальный ассистент для студентов и преподавателей.",
      partnerProgram: projectCardProgram(false),
    }),
  },
  {
    key: "submitted",
    label: "Сдан в программу",
    action: "Открыть",
    role: "Лидер",
    access: "только просмотр",
    canEdit: false,
    project: projectCardFixture({
      id: 104,
      name: "Анализ результатов исследования",
      shortDescription: "Решения для создания инклюзивной и комфортной образовательной среды.",
      partnerProgram: projectCardProgram(true),
    }),
  },
  {
    key: "program",
    label: "В программе",
    action: "Открыть",
    role: "Участник",
    access: "только просмотр",
    canEdit: false,
    project: projectCardFixture({
      id: 105,
      leader: 8,
      name: "TEST VALIDATION & SEVERAL PROCESSES",
      shortDescription: "info",
      partnerProgram: projectCardProgram(false),
    }),
  },
  {
    key: "submitted",
    label: "Сдан в программу",
    action: "Открыть",
    role: "Участник",
    access: "только просмотр",
    canEdit: false,
    project: projectCardFixture({
      id: 106,
      leader: 8,
      name: "Командное исследование",
      shortDescription: "Сданный проект участника команды.",
      partnerProgram: projectCardProgram(true),
    }),
  },
] as const;

/** Отрасли и их отсутствие проверяются на одних данных в подписках и витрине. */
export const publicProjectCardFixtures = [
  projectCardFixture({ id: 201, name: "Учимся вместе", industry: 1 }),
  projectCardFixture({ id: 202, name: "Открытая лаборатория технологий", industry: 2 }),
  projectCardFixture({ id: 203, name: "Сообщество добрых дел", industry: 3 }),
  projectCardFixture({ id: 204, name: "Проект без указанной отрасли", industry: undefined }),
];
