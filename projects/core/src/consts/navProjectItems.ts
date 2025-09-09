/** @format */

import { EditStep } from "@office/projects/edit/services/project-step.service";

/**
 * Элементы навигации для редактирования проекта
 * Используется в компоненте пошагового редактирования проекта
 */
export const navItems = [
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
