/** @format */

import { DomainEvent } from "@domain/shared/domain-event";

export interface LoggedOut extends DomainEvent {
  type: "LoggedOut";
  payload: Record<string, never>;
}

export function loggedOut(): LoggedOut {
  return { type: "LoggedOut", payload: {}, occurredAt: new Date() };
}
