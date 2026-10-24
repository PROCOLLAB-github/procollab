/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormControl } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize, map, Observable, of, Subject, switchMap, takeUntil } from "rxjs";
import { ButtonDirective, IconComponent } from "@uilib";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import {
  GetSolutionInvitationsUseCase,
  RemoveSolutionMemberUseCase,
  LeaveSolutionUseCase,
  TransferSolutionCaptainUseCase,
  UpdateSolutionInvitationUseCase,
  RevokeSolutionInvitationUseCase,
} from "@api/solution/use-cases/solution-team.use-cases";
import {
  ProgramSolution,
  SolutionApiError,
  SolutionInvitation,
  SolutionMember,
} from "@domain/solution/solution-contract.model";
import { fail, ok, Result } from "@domain/shared/result.type";
import { inviteRoleValidator } from "@api/invite/project-invite-form";
import { normalizeInviteText } from "@domain/invite/project-role-suggestions";
import { ProjectInviteDialogComponent } from "@ui/widgets/project-invite/project-invite-dialog.component";
import { ProjectInviteRoleInputComponent } from "@ui/widgets/project-invite/project-invite-role-input.component";
import { SolutionMemberInviteModalComponent } from "@ui/widgets/project-invite/solution-member-invite-modal.component";

@Component({
  selector: "app-solution-team",
  imports: [
    DatePipe,
    ButtonDirective,
    IconComponent,
    AvatarComponent,
    ProjectInviteDialogComponent,
    ProjectInviteRoleInputComponent,
    SolutionMemberInviteModalComponent,
  ],
  templateUrl: "./solution-team.component.html",
  styleUrl: "./solution-team.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolutionTeamComponent {
  readonly solution = input.required<ProgramSolution>();
  readonly refreshing = input(false);
  readonly changed = output<void>();
  readonly left = output<void>();
  readonly currentUser = inject(ProfileInfoService).profile;
  readonly pending = signal<SolutionInvitation[]>([]);
  readonly loading = signal(false);
  readonly listError = signal("");
  readonly error = signal("");
  private readonly pendingCommand = signal(false);
  readonly busy = computed(() => this.pendingCommand() || this.refreshing());
  readonly inviting = signal(false);
  readonly editing = signal<SolutionInvitation | null>(null);
  readonly role = new FormControl("", { nonNullable: true, validators: [inviteRoleValidator] });
  trigger: HTMLElement | null = null;
  private readonly list = inject(GetSolutionInvitationsUseCase);
  private readonly removeUseCase = inject(RemoveSolutionMemberUseCase);
  private readonly leaveUseCase = inject(LeaveSolutionUseCase);
  private readonly transferUseCase = inject(TransferSolutionCaptainUseCase);
  private readonly updateUseCase = inject(UpdateSolutionInvitationUseCase);
  private readonly revokeUseCase = inject(RevokeSolutionInvitationUseCase);
  private readonly destroyRef = inject(DestroyRef);
  private readonly listRevision = signal(0);
  private readonly changedContext = new Subject<void>();
  private contextKey = "";

  constructor() {
    effect(onCleanup => {
      const solution = this.solution();
      const key = solution.programId + ":" + solution.id;
      this.listRevision();
      const owner = this.currentUser()?.id === solution.captainId;
      if (key !== this.contextKey) {
        this.contextKey = key;
        this.changedContext.next();
        this.inviting.set(false);
        this.editing.set(null);
        this.error.set("");
      }
      this.pending.set([]);
      this.listError.set("");
      this.loading.set(false);
      if (!owner) {
        this.editing.set(null);
        this.inviting.set(false);
        return;
      }
      this.loading.set(true);
      const subscription = this.allPending(solution.programId, solution.id).subscribe(result => {
        this.loading.set(false);
        if (result.ok) {
          this.pending.set(result.value);
          const editing = untracked(this.editing);
          if (editing)
            this.editing.set(result.value.find(invitation => invitation.id === editing.id) || null);
        } else this.listError.set(result.error.detail);
      });
      onCleanup(() => subscription.unsubscribe());
    });
  }

  private allPending(
    programId: number,
    solutionId: number,
    offset = 0,
  ): Observable<Result<SolutionInvitation[], SolutionApiError>> {
    return this.list.execute(programId, solutionId, { status: "pending", limit: 100, offset }).pipe(
      switchMap(result => {
        if (!result.ok) return of(fail(result.error));
        const page = result.value;
        if (!page.next) return of(ok(page.results));
        if (!page.results.length)
          return of(
            fail({
              code: "invalid_response",
              detail: "Не удалось обновить приглашения. Повторите загрузку.",
              errors: [],
              meta: {},
            }),
          );
        return this.allPending(programId, solutionId, offset + page.results.length).pipe(
          map(next => (next.ok ? ok([...page.results, ...next.value]) : fail(next.error))),
        );
      }),
    );
  }

  reloadInvitations(): void {
    this.listRevision.update(value => value + 1);
  }

  openInvite(event: Event): void {
    if (!this.solution().permissions.canInvite || this.busy() || this.loading() || this.listError())
      return;
    this.trigger = event.currentTarget as HTMLElement;
    this.inviting.set(true);
  }

  remove(member: SolutionMember): void {
    const solution = this.solution();
    if (this.busy() || !solution.permissions.canManageTeam || member.isCaptain) return;
    if (
      !confirm(
        `Вы точно хотите исключить участника ${member.user.firstName} ${member.user.lastName}?`,
      )
    )
      return;
    this.command(
      this.removeUseCase.execute(solution.programId, solution.id, member.user.id, solution.version),
    );
  }

  transfer(member: SolutionMember): void {
    const solution = this.solution();
    if (this.busy() || !solution.permissions.canManageTeam || member.isCaptain) return;
    if (
      !confirm(
        `Передать капитанство участнику ${member.user.firstName} ${member.user.lastName}? Вы останетесь в команде.`,
      )
    )
      return;
    this.command(
      this.transferUseCase.execute(solution.programId, solution.id, {
        expectedSolutionVersion: solution.version,
        newCaptainUserId: member.user.id,
      }),
    );
  }

  leave(): void {
    const solution = this.solution();
    if (this.busy() || !solution.permissions.canLeave || !confirm("Выйти из команды заявки?"))
      return;
    this.command(
      this.leaveUseCase.execute(solution.programId, solution.id, {
        expectedSolutionVersion: solution.version,
      }),
      () => this.left.emit(),
      true,
    );
  }

  edit(invitation: SolutionInvitation, event: Event): void {
    if (this.busy() || !invitation.permissions.canEdit) return;
    this.trigger = event.currentTarget as HTMLElement;
    this.role.reset(invitation.role || "");
    this.error.set("");
    this.editing.set(invitation);
  }

  saveRole(): void {
    const invitation = this.editing();
    this.role.markAsTouched();
    if (
      this.busy() ||
      this.role.invalid ||
      !invitation?.permissions.canEdit ||
      !this.solution().permissions.canManageTeam
    )
      return;
    this.command(
      this.updateUseCase.execute(invitation.id, {
        expectedVersion: invitation.version,
        expectedSolutionVersion: this.solution().version,
        role: normalizeInviteText(this.role.value),
      }),
      () => this.editing.set(null),
    );
  }

  revoke(invitation: SolutionInvitation): void {
    if (
      this.busy() ||
      !invitation.permissions.canRevoke ||
      !confirm(
        `Отозвать приглашение участнику ${invitation.recipient.firstName} ${invitation.recipient.lastName}?`,
      )
    )
      return;
    this.command(
      this.revokeUseCase.execute(invitation.id, invitation.version, this.solution().version),
    );
  }

  private command(
    request: Observable<Result<unknown, SolutionApiError>>,
    after?: () => void,
    leaving = false,
  ): void {
    this.pendingCommand.set(true);
    this.error.set("");
    request
      .pipe(
        takeUntil(this.changedContext),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.pendingCommand.set(false)),
      )
      .subscribe(result => {
        if (!result.ok) {
          this.error.set(result.error.detail);
          if (
            [
              "version_conflict",
              "not_solution_captain",
              "team_frozen",
              "solution_mode_unavailable",
              "invite_already_processed",
            ].includes(result.error.code)
          )
            this.changed.emit();
          return;
        }
        after?.();
        if (!leaving) this.changed.emit();
      });
  }
}
