/** @format */
import { Project } from "@domain/project/project.model";
import { Collaborator } from "@domain/project/collaborator.model";
import { Invite } from "./invite.model";

/** Только programId из загруженного Project: programLinkId обозначает другую сущность. */
export function inviteProgramId(project: Project | null): number | null {
  const id = project?.partnerProgram?.programId;
  return typeof id === "number" && Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function inviteCandidateReason(
  userId: number,
  leaderId: number | undefined,
  collaborators: Collaborator[],
  invites: Invite[],
): string | null {
  if (userId === leaderId) return "Руководитель проекта";
  if (collaborators.some(member => member.userId === userId)) return "Уже в команде";
  if (invites.some(invite => invite.user.id === userId && invite.isAccepted === null)) {
    return "Приглашение уже отправлено";
  }
  return null;
}
