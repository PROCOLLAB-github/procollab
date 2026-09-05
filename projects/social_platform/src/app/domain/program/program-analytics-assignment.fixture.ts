/** @format */
import {
  ProgramAnalyticsAssignment,
  ProgramAnalyticsAssignmentCriterion,
  ProgramAnalyticsAssignmentScoreDetail,
  ProgramAnalyticsDelayedExpert,
} from "@domain/program/program-analytics.model";

export function assignment(
  overrides: Partial<ProgramAnalyticsAssignment> = {},
): ProgramAnalyticsAssignment {
  return {
    assignmentId: 17,
    expert: {
      expertId: 4,
      userId: 123,
      firstName: "Иван",
      lastName: "Иванов",
      fullName: "Иван Иванов",
      avatar: null,
    },
    project: { id: 55, name: "Проект А" },
    status: "completed",
    criteriaTotal: 5,
    criteriaScored: 5,
    assignedAt: "2026-09-01T10:00:00Z",
    projectSubmitted: true,
    projectSubmittedAt: "2026-09-01T12:00:00Z",
    waitingSince: null,
    waitingSeconds: null,
    ...overrides,
  };
}

export function criterion(
  overrides: Partial<ProgramAnalyticsAssignmentCriterion> = {},
): ProgramAnalyticsAssignmentCriterion {
  return {
    criterionId: 1,
    name: "Новизна",
    description: "Оцените новизну решения",
    type: "int",
    minValue: 0,
    maxValue: 10,
    value: "8",
    isScored: true,
    ...overrides,
  };
}

export function scoreDetail(): ProgramAnalyticsAssignmentScoreDetail {
  return {
    ...assignment(),
    scores: [
      criterion(),
      criterion({
        criterionId: 2,
        name: "Комментарий",
        type: "str",
        value: "Хорошая проработка",
        minValue: null,
        maxValue: null,
      }),
      criterion({ criterionId: 3, name: "Актуально", type: "bool", value: "True" }),
      criterion({ criterionId: 4, name: "Реализуемость", value: null, isScored: false }),
    ],
  };
}

export function delayedExpert(
  overrides: Partial<ProgramAnalyticsDelayedExpert> = {},
): ProgramAnalyticsDelayedExpert {
  return {
    ...assignment().expert,
    assignmentsTotal: 8,
    completed: 3,
    pending: 5,
    overdue24H: 3,
    overdue48H: 1,
    oldestWaitingSince: "2026-09-01T12:00:00Z",
    oldestWaitingSeconds: 187200,
    severity: "critical",
    ...overrides,
  };
}
