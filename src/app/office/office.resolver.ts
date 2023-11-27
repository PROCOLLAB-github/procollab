/** @format */

import { inject } from "@angular/core";
import { InviteService } from "@services/invite.service";
import { Invite } from "@models/invite.model";
import { ResolveFn } from "@angular/router";

export const OfficeResolver: ResolveFn<Invite[]> = () => {
  const inviteService = inject(InviteService);

  return inviteService.getMy();
};
