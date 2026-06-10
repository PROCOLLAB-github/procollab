/** @format */

import { Result } from "@domain/shared/result.type";
import { Invite } from "@domain/invite/invite.model";

/** Ошибки операций с инвайтами */
export type InviteError =
  | { kind: "unknown"; cause?: unknown }
  | { kind: "get_invites_error"; cause?: unknown };

/** Результат операций, которые не возвращают данные (accept, reject, revoke). */
export type InviteResult = Result<void, InviteError>;

/** Результат операций, которые возвращают список инвайтов (getMy, getForProject). */
export type InvitesResult = Result<Invite[], InviteError>;
