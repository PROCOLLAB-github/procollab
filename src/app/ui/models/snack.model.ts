/** @format */

export class Snack {
  id!: string;
  text!: string;
  timeout!: number;
  type!: "error" | "success" | "info";
}
