/** @format */

import { computed, inject, Injectable, signal } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { inviteToProjectMapper } from "@utils/helpers/inviteToProjectMapper";
import { Invite } from "projects/social_platform/src/app/domain/invite/invite.model";
import { Project } from "projects/social_platform/src/app/domain/project/project.model";

@Injectable()
export class ProjectsUIInfoService {
  private readonly fb = inject(FormBuilder);

  readonly myInvites = computed(() => this.allInvites().slice(0, 1));

  readonly allInvites = signal<Project[]>([]);

  readonly searchForm = this.fb.group({
    search: [""],
  });

  applySetProjectsInvites(invites: Invite[]): void {
    this.allInvites.set(inviteToProjectMapper(invites));
  }

  applyAcceptOrRejectInvite(inviteId: number): void {
    this.allInvites.update(list => list.filter(invite => invite.inviteId !== inviteId));
  }
}
