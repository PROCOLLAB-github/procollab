/** @format */

import { EditStep } from "projects/social_platform/src/app/api/project/project-step.service";

/**
 * Элементы навигации для редактирования проекта
 * Используется в компоненте пошагового редактирования проекта
 */
export const navProjectItems = [
  {
    step: "main" as EditStep, // Идентификатор шага
    src: "main",
    label: "основные данные", // Отображаемый текст
  },
  {
    step: "contacts" as EditStep,
    src: "contacts",
    label: "партнеры и ресурсы",
  },
  {
    step: "achievements" as EditStep,
    src: "achievements",
    label: "достижения",
  },
  {
    step: "vacancies" as EditStep,
    src: "vacancies",
    label: "вакансии",
  },
  {
    step: "team" as EditStep,
    src: "team",
    label: "команда",
  },
  {
    step: "additional" as EditStep,
    src: "additional",
    label: "данные для конкурсов",
  },
];
