/** @format */

/** Controlled send errors; transport details are never rendered in the invite form. */
export interface InviteSendError {
  kind:
    | "user_not_found"
    | "already_leader"
    | "already_member"
    | "already_invited"
    | "not_program_participant"
    | "unauthorized"
    | "forbidden"
    | "validation"
    | "network"
    | "server"
    | "unknown";
  message: string;
}
