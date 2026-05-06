/** @format */

import { Provider } from "@angular/core";
import { InviteRepositoryPort } from "@domain/invite/ports/invite.repository.port";
import { InviteRepository } from "../repository/invite/invite.repository";

export const INVITE_PROVIDERS: Provider[] = [
  { provide: InviteRepositoryPort, useExisting: InviteRepository },
];
