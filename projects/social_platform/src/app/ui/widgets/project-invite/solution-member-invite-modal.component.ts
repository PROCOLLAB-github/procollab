/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize, Subject, takeUntil } from "rxjs";
import { User } from "@domain/auth/user.model";
import {
  ProgramSolution,
  SolutionInvitation,
  SolutionInvitationCreated,
} from "@domain/solution/solution-contract.model";
import { normalizeInviteText } from "@domain/invite/project-role-suggestions";
import { createProjectInviteForm } from "@api/invite/project-invite-form";
import { InviteParticipantSearchFacade } from "@api/invite/facades/invite-participant-search.facade";
import { CreateSolutionInvitationUseCase } from "@api/solution/use-cases/solution-team.use-cases";
import { MemberInviteFormComponent } from "./member-invite-form.component";

@Component({
  selector: "app-solution-member-invite-modal",
  imports: [MemberInviteFormComponent],
  providers: [InviteParticipantSearchFacade],
  template: `<app-member-invite-form
    [query]="query"
    [role]="form.controls.role"
    [state]="search.state()"
    [selected]="selected()"
    [unavailableReason]="reason"
    [busy]="busy()"
    [valid]="form.valid && solution().permissions.canInvite && !reason(selected()?.id || 0)"
    [error]="error()"
    [trigger]="trigger()"
    description="Найдите участника и укажите его роль в команде"
    roleLabel="Роль в команде"
    (chosen)="select($event)"
    (cleared)="clear()"
    (closed)="closed.emit()"
    (submitted)="submit()"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolutionMemberInviteModalComponent {
  readonly solution = input.required<ProgramSolution>();
  readonly invitations = input<SolutionInvitation[]>([]);
  readonly trigger = input<HTMLElement | null>(null);
  readonly closed = output<void>();
  readonly created = output<SolutionInvitationCreated>();
  readonly refreshRequired = output<void>();
  readonly search = inject(InviteParticipantSearchFacade);
  readonly form = createProjectInviteForm();
  readonly query = new FormControl("", { nonNullable: true });
  readonly selected = signal<User | null>(null);
  readonly busy = signal(false);
  readonly error = signal("");
  private readonly create = inject(CreateSolutionInvitationUseCase);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changedContext = new Subject<void>();
  private contextKey = "";

  readonly reason = (id: number): string | null => {
    if (id === this.solution().captainId) return "Капитан команды";
    if (this.solution().team.members.some(member => member.user.id === id)) return "Уже в команде";
    if (
      this.invitations().some(invite => invite.recipient.id === id && invite.status === "pending")
    )
      return "Приглашение уже отправлено";
    return null;
  };

  constructor() {
    effect(() => {
      const selected = this.selected();
      this.invitations();
      const reason = selected ? this.reason(selected.id) : null;
      if (reason) this.error.set(reason);
    });
    this.query.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => this.search.search(value, this.solution().programId));
    effect(() => {
      const solution = this.solution();
      const key = solution.programId + ":" + solution.id;
      if (key !== this.contextKey) {
        this.contextKey = key;
        this.changedContext.next();
        this.form.reset({ recipientId: null, role: "" });
        this.query.reset("", { emitEvent: false });
        this.selected.set(null);
        this.error.set("");
      }
      this.search.search(this.query.value, solution.programId);
    });
  }

  select(user: User): void {
    if (this.busy() || this.reason(user.id)) return;
    this.selected.set(user);
    this.form.controls.recipientId.setValue(user.id);
  }
  clear(): void {
    this.selected.set(null);
    this.form.controls.recipientId.setValue(null);
  }
  submit(): void {
    const solution = this.solution();
    const id = this.selected()?.id;
    if (this.busy() || !solution.permissions.canInvite) return;
    this.form.markAllAsTouched();
    if (this.form.invalid || !id || this.form.controls.recipientId.value !== id || this.reason(id))
      return;
    this.busy.set(true);
    this.error.set("");
    this.create
      .execute(solution.programId, solution.id, {
        expectedSolutionVersion: solution.version,
        recipientUserId: id,
        role: normalizeInviteText(this.form.controls.role.value),
      })
      .pipe(
        takeUntil(this.changedContext),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.busy.set(false)),
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
              "duplicate_pending_invite",
            ].includes(result.error.code)
          )
            this.refreshRequired.emit();
          return;
        }
        this.created.emit(result.value);
        this.closed.emit();
      });
  }
}
