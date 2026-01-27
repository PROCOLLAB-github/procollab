/** @format */

import { Invite } from "projects/social_platform/src/app/domain/invite/invite.model";

export const inviteToProjectMapper = (invites: Invite[] = []): any[] => {
  return (invites ?? []).map((invite: Invite) => ({
    inviteId: invite.id,
    id: invite.project.id,
    imageAddress: invite.project.imageAddress,
    vacancies: invite.project.vacancies,
    collaborators: invite.project.collaborators,
    name: invite.project.name,
    shortDescription: invite.user.firstName + " " + invite.user.lastName,
    industry: invite.project.industry,
  }));
};
