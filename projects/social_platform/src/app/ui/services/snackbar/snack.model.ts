/** @format */

/** Модель уведомления snackbar. */
export class Snack {
  id!: string;
  text!: string;
  timeout!: number;
  type!: "error" | "success" | "info";
}
