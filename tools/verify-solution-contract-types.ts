/** @format */

import type {
  SolutionArchiveApplyRequest,
  SolutionArchivePreviewRequest,
  SolutionArchiveAdminChange,
  SolutionArchiveSnapshot,
  SolutionMemberRemovalApplyRequest,
  SolutionMemberRemovalPreviewRequest,
  SolutionMemberAdminChange,
  SolutionCaseChangePreviewRequest,
  SolutionCaseChangeApplyRequest,
  SolutionCaseChangePreview,
  SolutionAdminChange,
  SolutionAdminChangeDetail,
  SolutionSubmissionSnapshot,
  SolutionActionPreviewRequest,
  SolutionActionApplyRequest,
  SolutionUpdateInvitation,
  SolutionCreateInvitation,
  UpdateSolutionCommand,
  RateSolutionCommand,
  SolutionAllocationWrite,
  SolutionQuotaWrite,
  SolutionWidgetParticipant,
  SolutionWidgetOrganizer,
  SolutionManagerAssignment,
  SolutionManagerSolutionFunnel,
  SolutionReminderPreviewRequest,
  SolutionPublishedSolutionMember,
} from "../projects/social_platform/src/app/domain/solution/solution-contract.model";

const validSubmitPreview: SolutionActionPreviewRequest = { action: "submit", ids: [301] };
const validCasePreview: SolutionCaseChangePreviewRequest = { caseName: "Кейс A" };
const validCaseApply: SolutionCaseChangeApplyRequest = {
  ...validCasePreview,
  previewToken: "opaque",
};
// @ts-expect-error Case confirmation requires its own signed token.
const missingCaseToken: SolutionCaseChangeApplyRequest = { caseName: "Кейс A" };
// @ts-expect-error A project reference cannot be used as a case-change command.
const projectCaseCommand: SolutionCaseChangePreviewRequest = { caseName: "Кейс A", projectId: 301 };
const validSubmitApply: SolutionActionApplyRequest = {
  ...validSubmitPreview,
  previewToken: "opaque",
};
// @ts-expect-error Confirmation requires the exact signed preview token.
const missingSubmitToken: SolutionActionApplyRequest = { action: "submit", ids: [301] };
// @ts-expect-error Post-submission administrative exceptions are not part of this contract.
const destructiveSolutionAction: SolutionActionPreviewRequest = { action: "detach", ids: [301] };
const wrongSubmissionReference: SolutionActionPreviewRequest = {
  action: "submit",
  // @ts-expect-error Project link IDs cannot replace the required solution selection.
  projectIds: [301],
};
void [
  validCasePreview,
  validCaseApply,
  missingCaseToken,
  projectCaseCommand,
  validSubmitPreview,
  validSubmitApply,
  missingSubmitToken,
  destructiveSolutionAction,
  wrongSubmissionReference,
];

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
  SolutionPublishedQuery,
} from "../projects/social_platform/src/app/domain/solution/ports/solution.repository.port";

const publicQuery = { search: "Прототип", limit: 25, offset: 0 } satisfies SolutionPublishedQuery;
// @ts-expect-error Публичный список не принимает закрытый фильтр сдачи.
const privatePublicQuery: SolutionPublishedQuery = { submission: "submitted" };
function publishedMemberPrivacy(member: SolutionPublishedSolutionMember) {
  // @ts-expect-error В публичном участнике нет email.
  return member.user.email;
}
void publicQuery;
void privatePublicQuery;
void publishedMemberPrivacy;

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
const cleared: SolutionUpdateInvitation = {
  expectedVersion: 1,
  expectedSolutionVersion: 2,
  // @ts-expect-error Переданную роль нельзя очистить в null.
  role: null,
};
// @ts-expect-error Новое приглашение требует роль.
const missingInvitationRole: SolutionCreateInvitation = {
  expectedSolutionVersion: 1,
  recipientUserId: 9,
};
void missingInvitationRole;
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

const filteredExport: SolutionAnalyticsExportQuery = {
  kind: "solutions",
  fieldId: 123,
  answerState: "not_applicable",
  caseScope: "selected",
  caseName: "Кейс",
  scope: "awaiting_evaluation",
};
// @ts-expect-error Глобальная сводка не принимает фильтры списка решений.
const filteredProgramExport: SolutionAnalyticsExportQuery = { kind: "program", fieldId: 123 };
// @ts-expect-error Выгрузка оценок сохраняет полный scope.
const filteredScoresExport: SolutionAnalyticsExportQuery = { kind: "scores", search: "Кейс" };
// @ts-expect-error XLSX включает все найденные решения, без pagination.
const paginatedSolutionsExport: SolutionAnalyticsExportQuery = { kind: "solutions", limit: 20 };
const invalidAnswerState: SolutionAnalyticsExportQuery = {
  kind: "solutions",
  // @ts-expect-error Состояние ответа совпадает с C00, нового answered enum нет.
  answerState: "answered",
};

void [
  filteredExport,
  filteredProgramExport,
  filteredScoresExport,
  paginatedSolutionsExport,
  invalidAnswerState,
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

declare const administrativeHistory: SolutionAdminChangeDetail;
declare const casePreview: SolutionCaseChangePreview;
const preservedSubmission: SolutionSubmissionSnapshot | null = administrativeHistory.beforeSnapshot;
const confirmedEffects: {
  isSubmitted: boolean;
  removedAssignmentsCount: number;
  scoreCount: number;
} = casePreview;
const wrongHistoryReference: SolutionAdminChange["application"] = {
  kind: "solution",
  programId: 12,
  solutionId: 301,
  name: "Решение",
  // @ts-expect-error История решения не принимает идентификатор Project.
  projectId: 301,
};
void [preservedSubmission, confirmedEffects, wrongHistoryReference];

const memberRemoval: SolutionMemberRemovalPreviewRequest = { userId: 10 };
const confirmedMemberRemoval: SolutionMemberRemovalApplyRequest = {
  userId: 10,
  previewToken: "opaque",
};
// @ts-expect-error Подтверждение исключения требует подписанный preview token.
const unsignedMemberRemoval: SolutionMemberRemovalApplyRequest = { userId: 10 };
// @ts-expect-error Команда решения не принимает Project ID.
const projectMemberRemoval: SolutionMemberRemovalPreviewRequest = { userId: 10, projectId: 301 };
declare const historyEvent: SolutionAdminChange;
if (historyEvent.action === "remove_member") {
  const removed: SolutionMemberAdminChange = historyEvent;
  const affectedUser: number = removed.removedMember.user.id;
  // @ts-expect-error Поля смены кейса не относятся к исключению участника.
  const unrelatedCase: string = removed.caseName;
  void [affectedUser, unrelatedCase];
}
void [memberRemoval, confirmedMemberRemoval, unsignedMemberRemoval, projectMemberRemoval];

const archiveSelection: SolutionArchivePreviewRequest = { ids: [301] };
const archiveConfirmation: SolutionArchiveApplyRequest = { ids: [301], previewToken: "opaque" };
// @ts-expect-error Снятие заявки требует подтвержденный token.
const unsignedArchive: SolutionArchiveApplyRequest = { ids: [301] };
// @ts-expect-error Archive API принимает IDs решений без Project ID.
const projectArchive: SolutionArchivePreviewRequest = { ids: [301], projectId: 301 };
declare const archiveEvent: SolutionAdminChange;
if (archiveEvent.action === "archive") {
  const archive: SolutionArchiveAdminChange = archiveEvent;
  const stamp: string = archive.archivedAt;
  // @ts-expect-error Архивирование не является сменой кейса.
  const caseName: string = archive.caseName;
  void [stamp, caseName];
}
declare const draftArchive: SolutionArchiveSnapshot;
const capturedAt: string = draftArchive.capturedAt;
// @ts-expect-error Архивный снимок не означает искусственную сдачу.
const artificialSubmission: string = draftArchive.submittedAt;
void [
  archiveSelection,
  archiveConfirmation,
  unsignedArchive,
  projectArchive,
  capturedAt,
  artificialSubmission,
];
