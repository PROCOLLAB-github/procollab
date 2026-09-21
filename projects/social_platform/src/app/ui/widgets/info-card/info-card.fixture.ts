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
    name: "Кейс для Ростовской области",
    shortDescription: "Проект для комфортной жизни и совместной работы студентов.",
    imageAddress: "/assets/images/projects/shared/idea.svg",
    industry: 1,
    ...overrides,
  };
}

/** Четыре состояния используют одинаковый контракт в component tests и visual smoke. */
export const myProjectCardFixtures = [
  {
    key: "draft",
    label: "Черновик",
    action: "Продолжить",
    project: projectCardFixture({
      id: 101,
      draft: true,
      name: "Мобильное приложение для студентов",
      shortDescription: "Удобный сервис для организации учебного процесса и студенческой жизни.",
    }),
  },
  {
    key: "published",
    label: "Опубликован",
    action: "Открыть",
    project: projectCardFixture({
      id: 102,
      name: "Зелёный кампус",
      shortDescription: "Инициативы для более экологичного и комфортного университета.",
    }),
  },
  {
    key: "program",
    label: "В программе",
    action: "Открыть",
    project: projectCardFixture({
      id: 103,
      name: "AI-помощник для образования",
      shortDescription: "Интеллектуальный ассистент для студентов и преподавателей.",
      partnerProgram: projectCardProgram(false),
    }),
  },
  {
    key: "submitted",
    label: "Сдан на проверку",
    action: "Открыть",
    project: projectCardFixture({
      id: 104,
      name: "Доступная среда в вузе",
      shortDescription: "Решения для создания инклюзивной и комфортной образовательной среды.",
      partnerProgram: projectCardProgram(true),
    }),
  },
] as const;
