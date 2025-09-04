/** @format */

import { EditStep } from "@office/projects/edit/services/project-step.service";

/**
 * Элементы навигации для редактирования проекта
 * Используется в компоненте пошагового редактирования проекта
 */
export const navItems = [
  {
    step: "main" as EditStep, // Идентификатор шага
    label: "Основные данные", // Отображаемый текст
  },
  {
    step: "contacts" as EditStep,
    label: "Партнеры и ресурсы",
  },
  {
    step: "achievements" as EditStep,
    label: "Достижения",
  },
  {
    step: "vacancies" as EditStep,
    label: "Вакансии",
  },
  {
    step: "team" as EditStep,
    label: "Команда",
  },
  {
    step: "additional" as EditStep,
    label: "Данные для конкурсов",
  },
];
