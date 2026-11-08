/** @format */
import { Program } from "./program.model";
import { ManagementPage } from "./program-management.model";
import { ProgramImageFraming } from "./program-image-framing.model";

export type ProgramFormat = "case_championship" | "hackathon" | "noncompetitive";
export const PROGRAM_FORMATS: { id: ProgramFormat; label: string; description: string }[] = [
  {
    id: "case_championship",
    label: "Кейс-чемпионат",
    description: "Кейс, описание решения и презентация",
  },
  {
    id: "hackathon",
    label: "Хакатон",
    description: "Задача, репозиторий и инструкция запуска",
  },
  {
    id: "noncompetitive",
    label: "Без конкурса",
    description: "Регистрация и материалы без конкурсной сдачи",
  },
];
export interface ManagedProgram {
  id: number;
  name: string;
  draft: boolean;
  imageAddress?: string | null;
  imageFraming?: ProgramImageFraming | null;
  programFormat: ProgramFormat | null;
  solutionStorageMode?: "legacy_project" | "solution";
  updatedAt: string;
  datetimeStarted: string | null;
  datetimeFinished: string | null;
  datetimeRegistrationEnds: string | null;
}
export interface ProgramCreation {
  name: string;
  format: ProgramFormat;
  idempotencyKey: string;
}
export interface LaunchCheck {
  code: "page" | "dates" | "registration";
  title: string;
  ready: boolean;
  detail: string;
  section: "basic" | "dates" | "registration";
}
export interface ProgramLaunch {
  program: ManagedProgram;
  revision: string;
  checks: LaunchCheck[];
  canPublish: boolean;
  blockers: { code: string; section: string; detail: string }[];
  warnings: string[];
  links: { program: string; registration: string | null };
}
export type ManagedProgramsPage = ManagementPage<ManagedProgram>;
export interface ManagedProgramsQuery {
  search: string;
  limit: number;
  offset: number;
}
export type ProgramPreview = Program & { preview: true };
