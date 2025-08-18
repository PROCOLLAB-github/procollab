/** @format */

import { EditStep } from "@office/projects/edit/services/project-step.service";

/**
 * Элементы навигации для редактирования проекта
 * Используется в компоненте пошагового редактирования проекта
 */
export const navItems = [
  {
    step: "main" as EditStep, // Идентификатор шага
    src: "/assets/images/projects/edit/main.svg", // Путь к иконке
    label: "Основные данные", // Отображаемый текст
  },
  {
    step: "contacts" as EditStep,
    src: "/assets/images/projects/edit/contacts.svg",
    label: "Контакты и ссылки",
  },
  {
    step: "achievements" as EditStep,
    src: "/assets/images/projects/edit/achievements.svg",
    label: "Достижения",
  },
  {
    step: "vacancies" as EditStep,
    src: "/assets/images/projects/edit/vacancies.svg",
    label: "Вакансии",
  },
  {
    step: "team" as EditStep,
    src: "/assets/images/projects/edit/team.svg",
    label: "Команда",
  },
  {
    step: "additional" as EditStep,
    src: "/assets/images/projects/edit/additional.svg",
    label: "Доп. сведения",
  },
];
