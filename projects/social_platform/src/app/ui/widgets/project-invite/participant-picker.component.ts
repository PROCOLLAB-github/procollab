/** @format */
import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { User } from "@domain/auth/user.model";
import { Collaborator } from "@domain/project/collaborator.model";
import { Invite } from "@domain/invite/invite.model";
import { inviteCandidateReason } from "@domain/invite/invite-candidates";
import { InviteSearchState } from "@api/invite/facades/invite-participant-search.facade";
import { InviteUserSummaryComponent } from "./invite-user-summary.component";

@Component({
  selector: "app-participant-picker",
  imports: [InviteUserSummaryComponent],
  template: `
    @if (selected(); as user) {
      <p class="invite-label">Выбранный участник</p>
      <div class="invite-row invite-row--selected">
        <app-invite-user-summary [user]="user" />
        <button
          type="button"
          class="clear-recipient"
          aria-label="Очистить выбранного участника"
          [disabled]="busy()"
          (click)="cleared.emit()"
        >
          ×
        </button>
      </div>
    } @else {
      @switch (state().status) {
        @case ("initial") {
          <p class="invite-helper">Введите имя или фамилию участника</p>
        }
        @case ("loading") {
          <p class="invite-helper" role="status">
            <span class="invite-spinner" aria-hidden="true"></span> Ищем участников…
          </p>
        }
        @case ("error") {
          <p class="invite-helper" role="alert">
            Не удалось найти участников. Измените запрос и попробуйте снова.
          </p>
        }
        @case ("success") {
          @if (!state().users.length) {
            <p class="invite-helper" role="status">Участники не найдены. Попробуйте другое имя.</p>
          }
          <div class="invite-rows" role="radiogroup" aria-label="Найденные участники">
            @for (user of state().users; track user.id) {
              <button
                type="button"
                class="invite-row"
                role="radio"
                aria-checked="false"
                [disabled]="!!reason(user.id) || busy()"
                (click)="chosen.emit(user)"
              >
                <span class="candidate-content">
                  <app-invite-user-summary [user]="user" />
                  @if (reason(user.id); as reason) {
                    <span class="candidate-reason">{{ reason }}</span>
                  }
                </span>
                <span class="invite-radio" aria-hidden="true"></span>
              </button>
            }
          </div>
        }
      }
    }
  `,
  styles: [
    `
      .candidate-content {
        flex: 1;
        min-width: 0;
      }
      .candidate-reason {
        display: block;
        margin: 5px 0 0 50px;
        font-size: 11px;
        color: var(--grey-for-text);
      }
      .clear-recipient {
        flex: 0 0 44px;
        height: 44px;
        padding: 0;
        font-size: 26px;
        color: var(--accent);
        cursor: pointer;
        background: transparent;
        border: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipantPickerComponent {
  readonly state = input.required<InviteSearchState>();
  readonly selected = input<User | null>(null);
  readonly leaderId = input<number>();
  readonly collaborators = input<Collaborator[]>([]);
  readonly invites = input<Invite[]>([]);
  readonly busy = input(false);
  readonly chosen = output<User>();
  readonly cleared = output<void>();

  reason(id: number): string | null {
    return inviteCandidateReason(id, this.leaderId(), this.collaborators(), this.invites());
  }
}
