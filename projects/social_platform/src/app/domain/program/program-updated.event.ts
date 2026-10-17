/** @format */

import { DomainEvent } from "@domain/shared/domain-event";
export interface ProgramUpdated extends DomainEvent {
  type: "ProgramUpdated";
  payload: { programId: number };
}
