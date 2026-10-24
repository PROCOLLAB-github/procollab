/** @format */

import type {
  SolutionUpdateInvitation,
  UpdateSolutionCommand,
} from "../projects/social_platform/src/app/domain/solution/solution-contract.model";

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

void [
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
];
