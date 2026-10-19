/** @format */
import {
  ExpertInvitation,
  ExpertRegistration,
  ExpertRegistered,
  InvitationAccepted,
} from "./evaluation-workspace.model";
export interface OrganizerRow {
  id: string;
  userId?: number;
  invitationId?: number;
  name: string | null;
  email: string;
  avatar: string | null;
  status: "joined" | "pending" | "expired";
  active?: boolean;
  deliveryStatus?: "queued" | "sent" | "failed";
  isSelf: boolean;
  canRemove: boolean;
}
export interface ProgramOrganizers {
  revision: string;
  organizers: OrganizerRow[];
  organizerCount: number;
  activeOrganizerCount: number;
  invitationCount: number;
}
export interface OrganizerAccessRemoved {
  accessRemoved: true;
  programId: number;
}
export interface OrganizerRegistration extends ExpertRegistration {
  birthday?: string;
}
export type {
  ExpertInvitation as OrganizerInvitation,
  ExpertRegistered as OrganizerRegistered,
  InvitationAccepted,
};
