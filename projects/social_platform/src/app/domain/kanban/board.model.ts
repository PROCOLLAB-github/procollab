/** @format */

export interface Board {
  id: number;
  name: string;
  description: string;
  color:
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
  icon:
    | "task"
    | "key"
    | "command"
    | "anchor"
    | "in-search"
    | "suitcase"
    | "person"
    | "deadline"
    | "main"
    | "attach"
    | "send"
    | "contacts"
    | "graph"
    | "phone"
    | "people-bold";
}
