/** @format */
import {
  ProgramCasePage,
  ProgramCaseProject,
  ProgramCaseSelection,
} from "./program-case-analytics.model";

export const selectedCase: ProgramCaseSelection = {
  scope: "selected",
  caseName: "Цифровая трансформация",
};
export const caseMetrics = {
  projectsTotal: 2,
  participantsTotal: 5,
  submitted: 1,
  notSubmitted: 1,
};
export function caseProject(overrides: Partial<ProgramCaseProject> = {}): ProgramCaseProject {
  return {
    programProjectId: 901,
    project: {
      id: 73,
      name: "Умный город",
      region: "Москва",
      presentationAddress: "https://example.org/deck.pdf",
    },
    case: { kind: "selected", name: "Цифровая трансформация" },
    leader: { userId: 14, fullName: "Анна Иванова" },
    teamSize: 3,
    linkedAt: "2026-09-01T10:00:00Z",
    submitted: true,
    submittedAt: "2026-09-20T11:00:00Z",
    ...overrides,
  };
}
export function casePage(overrides: Partial<ProgramCasePage> = {}): ProgramCasePage {
  return {
    count: 2,
    next: null,
    previous: null,
    results: [
      caseProject(),
      caseProject({
        programProjectId: 902,
        project: { id: 74, name: "Второй проект", region: null, presentationAddress: null },
        leader: null,
        teamSize: 1,
        submitted: false,
        submittedAt: null,
      }),
    ],
    selection: { scope: "selected", caseName: "Цифровая трансформация" },
    casesConfigured: true,
    submissionApplicable: true,
    caseMetrics: { ...caseMetrics },
    ...overrides,
  };
}
