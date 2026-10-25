/** @format */

import type {
  SolutionUpdateInvitation,
  UpdateSolutionCommand,
  RateSolutionCommand,
  SolutionAllocationWrite,
  SolutionQuotaWrite,
  SolutionWidgetParticipant,
  SolutionWidgetOrganizer,
  SolutionManagerAssignment,
  SolutionManagerSolutionFunnel,
  SolutionReminderPreviewRequest,
} from "../projects/social_platform/src/app/domain/solution/solution-contract.model";

const reminderSelection = {
  selection: { mode: "selected", ids: [301] },
} satisfies SolutionReminderPreviewRequest;
// @ts-expect-error Для selected нужны настоящие IDs решений.
const reminderWithoutIds: SolutionReminderPreviewRequest = { selection: { mode: "selected" } };
void reminderSelection;
void reminderWithoutIds;
import type {
  SolutionResultsExportQuery,
  SolutionAnalyticsExportQuery,
} from "../projects/social_platform/src/app/domain/solution/ports/solution.repository.port";

const validResultsExport = {
  scope: "all",
  caseScope: "selected",
  caseName: "Задача 1",
} satisfies SolutionResultsExportQuery;
// @ts-expect-error Выгрузка принимает только current/all.
const invalidResultsExport: SolutionResultsExportQuery = { scope: "everything" };

// Независимые примеры C00: у обеих команд обязательны ревизии и хотя бы одно изменение.
const role = {
  expectedVersion: 1,
  expectedSolutionVersion: 2,
  role: "Аналитик",
} satisfies SolutionUpdateInvitation;
const cleared = {
  expectedVersion: 1,
  expectedSolutionVersion: 2,
  role: null,
} satisfies SolutionUpdateInvitation;
const text = {
  expectedVersion: 1,
  expectedSolutionVersion: 2,
  motivationalLetter: "Текст",
} satisfies SolutionUpdateInvitation;
const name = {
  expectedVersion: 1,
  expectedFormRevision: "revision",
  name: "Решение",
} satisfies UpdateSolutionCommand;
const answers = {
  expectedVersion: 1,
  expectedFormRevision: "revision",
  answers: [{ fieldId: 1, value: false }],
} satisfies UpdateSolutionCommand;

// @ts-expect-error Требуется хотя бы одно изменяемое поле приглашения.
const emptyInvite: SolutionUpdateInvitation = { expectedVersion: 1, expectedSolutionVersion: 2 };
// @ts-expect-error Ревизия решения обязательна.
const missingVersion: SolutionUpdateInvitation = { expectedVersion: 1, role: "Аналитик" };
const invalidRole: SolutionUpdateInvitation = {
  expectedVersion: 1,
  expectedSolutionVersion: 2,
  // @ts-expect-error Роль не является числом.
  role: 5,
};
// @ts-expect-error Требуется имя или список изменяемых ответов.
const emptySolution: UpdateSolutionCommand = {
  expectedVersion: 1,
  expectedFormRevision: "revision",
};
// @ts-expect-error Отсутствует обязательная ревизия формы.
const missingRevision: UpdateSolutionCommand = { expectedVersion: 1, name: "Решение" };

const validRating = {
  expectedCriteriaRevision: "revision",
  scores: [{ criterionId: 21, value: "False" }],
} satisfies RateSolutionCommand;
// @ts-expect-error Оценка требует подтвержденную ревизию критериев.
const missingCriteriaRevision: RateSolutionCommand = { scores: [] };
const wrongRatingValue: RateSolutionCommand = {
  expectedCriteriaRevision: "revision",
  scores: [
    // @ts-expect-error На проводе оценки используют string/null, а не boolean.
    { criterionId: 21, value: false },
  ],
};
const validPlan = {
  revision: "revision",
  expertIds: [91],
  solutionIds: [301],
} satisfies SolutionAllocationWrite;
// @ts-expect-error Распределение не принимает projectIds вместо обязательных expertIds.
const wrongPlan: SolutionAllocationWrite = { revision: "revision", projectIds: [301] };
// @ts-expect-error Изменение числа экспертов требует ревизию назначений.
const missingQuotaRevision: SolutionQuotaWrite = { requiredEvaluators: 2 };

const solutionWidgetParticipant: SolutionWidgetParticipant = {
  application: { kind: "solution", programId: 12, solutionId: 301, name: "Решение" },
  caseProvided: false,
  caseName: null,
  stage: "not_submitted",
  submissionOpen: true,
};
const wrongWidgetReference: SolutionWidgetParticipant = {
  ...solutionWidgetParticipant,
  // @ts-expect-error Решение не принимает projectId вместо solutionId.
  application: { kind: "solution", programId: 12, projectId: 55, name: "Решение" },
};
const wrongWidgetProjection: SolutionWidgetParticipant = {
  ...solutionWidgetParticipant,
  // @ts-expect-error У решения нет фиктивного participantProject.
  participantProject: { id: 55, name: "Проект", programLinkId: 65 },
};
const solutionOrganizer: SolutionWidgetOrganizer = {
  participants: 1,
  solutions: 0,
  submittedSolutions: null,
  participantsWithoutSolution: 1,
};

const noncompetitiveFunnel: SolutionManagerSolutionFunnel = {
  created: 1,
  submissionApplicable: false,
  submitted: null,
  notSubmitted: null,
  evaluated: null,
};
const assignmentReference: SolutionManagerAssignment["application"] = {
  kind: "solution",
  programId: 12,
  solutionId: 301,
  name: "Решение",
};
const wrongAssignmentReference: SolutionManagerAssignment["application"] = {
  kind: "solution",
  programId: 12,
  name: "Решение",
  // @ts-expect-error Назначение решения не принимает projectId.
  projectId: 301,
};
// @ts-expect-error Выгрузка решения не принимает legacy kind проектов.
const wrongAnalyticsExport: SolutionAnalyticsExportQuery = { kind: "projects" };

void [
  noncompetitiveFunnel,
  assignmentReference,
  wrongAssignmentReference,
  wrongAnalyticsExport,
  validResultsExport,
  invalidResultsExport,
  role,
  cleared,
  text,
  name,
  answers,
  emptyInvite,
  missingVersion,
  invalidRole,
  emptySolution,
  missingRevision,
  validRating,
  missingCriteriaRevision,
  wrongRatingValue,
  validPlan,
  wrongPlan,
  missingQuotaRevision,
  solutionWidgetParticipant,
  wrongWidgetReference,
  wrongWidgetProjection,
  solutionOrganizer,
];
