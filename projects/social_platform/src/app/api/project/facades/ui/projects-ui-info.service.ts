/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { inviteToProjectMapper } from "@utils/inviteToProjectMapper";
import { InviteInfoService } from "@api/invite/invite-info.service";

/** UI-проекция проектов: общие computed-сигналы. */
@Injectable()
export class ProjectsUIInfoService {
  private readonly fb = inject(FormBuilder);
  private readonly inviteInfoService = inject(InviteInfoService);

  readonly allInvites = computed(() => {
    return inviteToProjectMapper(this.inviteInfoService.invites());
  });

  readonly myInvites = computed(() => this.allInvites().slice(0, 1));

  readonly searchForm = this.fb.group({
    search: [""],
  });
}
