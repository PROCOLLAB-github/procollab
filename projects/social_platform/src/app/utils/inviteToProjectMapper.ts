/** @format */

import { Invite } from "@domain/invite/invite.model";
import { InviteProjectSummary } from "@domain/project/invite-project-summary.model";

export const inviteToProjectMapper = (invites: Invite[] = []): InviteProjectSummary[] => {
  return (invites ?? []).map((invite: Invite) => ({
    inviteId: invite.id,
    id: invite.project.id,
    imageAddress: invite.project.imageAddress,
    vacancies: invite.project.vacancies,
    collaborators: invite.project.collaborators,
    name: invite.project.name,
    shortDescription:
      [invite.sender?.firstName, invite.sender?.lastName].filter(Boolean).join(" ") ||
      "Пользователь",
    industry: invite.project.industry,
  }));
};
