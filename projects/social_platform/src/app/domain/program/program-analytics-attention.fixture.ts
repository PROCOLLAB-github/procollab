/** @format */
import {
  ProgramAnalyticsAttentionPage,
  ProgramAnalyticsAttentionParticipant,
  ProgramAnalyticsAttentionProject,
  ProgramAnalyticsAttentionProjects,
} from "./program-analytics-attention.model";

export const attentionParticipant = (
  overrides: Partial<ProgramAnalyticsAttentionParticipant> = {},
): ProgramAnalyticsAttentionParticipant => ({
  userId: 123,
  fullName: "Анна Петрова",
  avatar: null,
  city: "Набережные Челны",
  registeredAt: "2026-09-01T10:00:00+03:00",
  ...overrides,
});

export const attentionProject = (
  overrides: Partial<ProgramAnalyticsAttentionProject> = {},
): ProgramAnalyticsAttentionProject => ({
  programProjectId: 70,
  project: { id: 55, name: "Проект А" },
  leader: { userId: 123, fullName: "Анна Петрова", avatar: null },
  submittedAt: "2026-09-03T12:00:00+03:00",
  status: "partially_evaluated",
  reason: "partially_evaluated",
  reasonLabel: "Частично оценено",
  assignmentsTotal: 3,
  assignmentsCompleted: 1,
  ...overrides,
});

export const participantsPage = (
  overrides: Partial<ProgramAnalyticsAttentionPage<ProgramAnalyticsAttentionParticipant>> = {},
): ProgramAnalyticsAttentionPage<ProgramAnalyticsAttentionParticipant> => ({
  count: 1,
  next: null,
  previous: null,
  results: [attentionParticipant()],
  ...overrides,
});

export const projectsPage = (
  overrides: Partial<ProgramAnalyticsAttentionProjects> = {},
): ProgramAnalyticsAttentionProjects => ({
  count: 1,
  next: null,
  previous: null,
  results: [attentionProject()],
  mode: "distributed",
  ...overrides,
});
