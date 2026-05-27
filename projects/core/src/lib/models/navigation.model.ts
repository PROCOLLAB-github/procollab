/** @format */

import { EditStep } from "./edit-step";

/** Элемент навигации шагов редактирования (sidebar / step-list). */
export interface Navigation {
  step: EditStep;
  src: string;
  label: string;
}
