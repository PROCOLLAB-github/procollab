/** @format */

import { EditStep } from "projects/social_platform/src/app/api/project/project-step.service";

export const navProfileItems = [
  {
    step: "main" as EditStep,
    src: "main",
    label: "основные данные",
  },
  {
    step: "education" as EditStep,
    src: "in-search",
    label: "образование",
  },
  {
    step: "experience" as EditStep,
    src: "suitcase",
    label: "работа",
  },
  {
    step: "achievements" as EditStep,
    src: "medal",
    label: "достижения",
  },
  {
    step: "skills" as EditStep,
    src: "squiz",
    label: "навыки",
  },
  {
    step: "settings" as EditStep,
    src: "settings",
    label: "действия",
  },
];
