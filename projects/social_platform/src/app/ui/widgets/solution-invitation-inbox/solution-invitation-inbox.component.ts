/** @format */

import { ChangeDetectionStrategy, Component, DestroyRef, inject, output } from "@angular/core";
import { Router } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ButtonDirective, InviteManageCardComponent } from "@uilib";
import { SolutionInvitationInboxService } from "@api/solution/facades/solution-invitation-inbox.service";
import { SolutionInvitation } from "@domain/solution/solution-contract.model";
import { solutionApplicationRoute } from "@api/solution/solution-navigation";

@Component({
  selector: "app-solution-invitation-inbox",
  imports: [InviteManageCardComponent, ButtonDirective],
  template: `
    @if (inbox.loading() && !inbox.items().length) {
      <p role="status">Загружаем приглашения в команды…</p>
    }
    @if (inbox.error()) {
      <p role="alert">{{ inbox.error() }}</p>
      <button
        appButton="secondary"
        type="button"
        [disabled]="inbox.loading()"
        (click)="inbox.refresh()"
      >
        Обновить приглашения
      </button>
    }
    <ul aria-label="Приглашения в команды программ">
      @for (invitation of inbox.items(); track invitation.id) {
        <li>
          <app-invite-manage-card
            [notice]="notice(invitation)"
            (accept)="answer(invitation, 'accept')"
            (reject)="answer(invitation, 'decline')"
          />
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    ul {
      padding: 0;
      margin: 0;
      list-style: none;
    }
    li {
      margin-bottom: 12px;
    }
    p {
      font-size: 12px;
      line-height: 1.5;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SolutionInvitationInboxComponent {
  readonly inbox = inject(SolutionInvitationInboxService);
  readonly handled = output<void>();
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  notice(invitation: SolutionInvitation) {
    return {
      id: invitation.id,
      senderId: invitation.captain.id,
      senderName: invitation.captain.firstName + " " + invitation.captain.lastName,
      avatarUrl: invitation.captain.avatarUrl,
      resourceName: invitation.solution.name,
      resourceLabel: "команду заявки",
      context: invitation.program.name,
      role: invitation.role,
      canAccept: invitation.permissions.canAccept && this.inbox.pendingId() === null,
      canDecline: invitation.permissions.canDecline && this.inbox.pendingId() === null,
      pending: this.inbox.pendingId() === invitation.id,
    };
  }

  answer(invitation: SolutionInvitation, decision: "accept" | "decline"): void {
    this.inbox
      .action(invitation, decision)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (!result.ok) return;
        this.handled.emit();
        if (result.value.application) {
          const route = solutionApplicationRoute(result.value.application);
          void this.router.navigate([route.path], {
            queryParams: { ...route.queryParams, tab: "team" },
          });
        }
      });
  }
}
