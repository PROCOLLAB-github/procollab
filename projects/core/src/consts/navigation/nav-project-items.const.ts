/** @format */

import { EditStep } from "projects/social_platform/src/app/api/project/project-step.service";

/**
 * Элементы навигации для редактирования проекта
 * Используется в компоненте пошагового редактирования проекта
 */
export const navProjectItems = [
  {
    step: "main" as EditStep, // Идентификатор шага
    label: "основные данные", // Отображаемый текст
  },
  {
    step: "contacts" as EditStep,
    label: "партнеры и ресурсы",
  },
  {
    step: "achievements" as EditStep,
    label: "достижения",
  },
  {
    step: "vacancies" as EditStep,
    label: "вакансии",
  },
  {
    step: "team" as EditStep,
    label: "команда",
  },
  {
    step: "additional" as EditStep,
    label: "данные для конкурсов",
  },
];
