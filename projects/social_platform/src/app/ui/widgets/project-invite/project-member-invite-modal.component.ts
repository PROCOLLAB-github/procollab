/** @format */

import { ButtonDirective, FieldDirective, StateComponent } from "@uilib";
/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  ViewChild,
} from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Project } from "@domain/project/project.model";
import { User } from "@domain/auth/user.model";
import { inviteCandidateReason, inviteProgramId } from "@domain/invite/invite-candidates";
import { isLoading } from "@domain/shared/async-state";
import { InviteParticipantSearchFacade } from "@api/invite/facades/invite-participant-search.facade";
import { ProjectTeamUIService } from "@api/project/facades/edit/ui/project-team-ui.service";
import { ProjectTeamService } from "@api/project/facades/edit/project-team.service";
import { ProjectInviteDialogComponent } from "./project-invite-dialog.component";
import { ProjectInviteRoleInputComponent } from "./project-invite-role-input.component";
import { ParticipantPickerComponent } from "./participant-picker.component";

@Component({
  selector: "app-project-member-invite-modal",
  imports: [
    StateComponent,
    ButtonDirective,
    FieldDirective,
    ReactiveFormsModule,
    ProjectInviteDialogComponent,
    ProjectInviteRoleInputComponent,
    ParticipantPickerComponent,
  ],
  providers: [InviteParticipantSearchFacade],
  templateUrl: "./project-member-invite-modal.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectMemberInviteModalComponent {
  readonly project = input<Project | null>(null);
  readonly projectId = input.required<number>();
  readonly trigger = input<HTMLElement | null>(null);
  readonly closed = output<void>();
  readonly ui = inject(ProjectTeamUIService);
  readonly team = inject(ProjectTeamService);
  readonly search = inject(InviteParticipantSearchFacade);
  readonly query = new FormControl("", { nonNullable: true });
  readonly isLoading = isLoading;
  @ViewChild("searchInput") private searchInput!: ElementRef<HTMLInputElement>;

  constructor() {
    const destroyRef = inject(DestroyRef);
    this.query.valueChanges
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(value => this.search.search(value, inviteProgramId(this.project())));
    effect(() => this.search.search(this.query.value, inviteProgramId(this.project())));
  }

  select(user: User): void {
    if (
      inviteCandidateReason(
        user.id,
        this.project()?.leader,
        this.ui.collaborators(),
        this.ui.invites(),
      )
    )
      return;
    this.ui.selectRecipient(user);
  }

  clear(): void {
    this.ui.selectRecipient(null);
    this.searchInput.nativeElement.focus();
  }
}
