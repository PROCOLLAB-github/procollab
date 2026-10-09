/** @format */

import { ButtonDirective, StateComponent } from "@uilib";
/** @format */
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from "@angular/core";
import { Project } from "@domain/project/project.model";
import { ProjectInviteForm } from "@api/invite/project-invite-form";
import { InviteSendError } from "@domain/invite/invite-send-error";
import { normalizeInviteText } from "@domain/invite/project-role-suggestions";
import { ProjectInviteDialogComponent } from "./project-invite-dialog.component";
import { ProjectInviteRoleInputComponent } from "./project-invite-role-input.component";

@Component({
  selector: "app-profile-project-invite-modal",
  imports: [
    StateComponent,
    ButtonDirective,
    ProjectInviteDialogComponent,
    ProjectInviteRoleInputComponent,
  ],
  templateUrl: "./profile-project-invite-modal.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileProjectInviteModalComponent {
  readonly projects = input.required<Project[]>();
  readonly form = input.required<ProjectInviteForm>();
  readonly selectedProjectId = input<number | null>(null);
  readonly loading = input(false);
  readonly error = input<InviteSendError | null>(null);
  readonly trigger = input<HTMLElement | null>(null);
  readonly selected = output<number>();
  readonly sent = output<void>();
  readonly closed = output<void>();
  readonly projectsRequested = output<void>();
  readonly query = signal("");
  readonly getProjectDisplayName = (project: Project): string =>
    normalizeInviteText(project.name ?? "") || "Проект без названия";

  readonly filteredProjects = computed(() => {
    const query = normalizeInviteText(this.query()).toLocaleLowerCase();
    return this.projects().filter(project =>
      this.getProjectDisplayName(project).toLocaleLowerCase().includes(query),
    );
  });
}
