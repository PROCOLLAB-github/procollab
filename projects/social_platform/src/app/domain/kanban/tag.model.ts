/** @format */

export class Tag {
  id!: number;
  name!: string;
  color!:
    | "primary"
    | "secondary"
    | "accent"
    | "accent-medium"
    | "blue-dark"
    | "cyan"
    | "red"
    | "complete"
    | "complete-dark"
    | "soft";
}
