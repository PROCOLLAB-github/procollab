/** @format */
import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { User } from "@domain/auth/user.model";

@Component({
  selector: "app-invite-user-summary",
  template: `
    <span class="invite-avatar">
      @if (user().personal.avatar) {
        <img [src]="user().personal.avatar" alt="" />
      } @else {
        {{ (user().firstName || "").slice(0, 1) }}{{ (user().lastName || "").slice(0, 1) }}
      }
    </span>
    <span class="invite-copy">
      <strong>{{ user().firstName }} {{ user().lastName }}</strong>
      <span class="invite-meta"
        >{{ age() }}{{ age() && user().personal.speciality ? " · " : ""
        }}{{ user().personal.speciality }}</span
      >
      <span class="invite-skills">
        @for (skill of skills().slice(0, 2); track skill.id) {
          <span>{{ skill.name }}</span>
        }
        @if (skills().length > 2) {
          <span>+{{ skills().length - 2 }}</span>
        }
      </span>
    </span>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex: 1;
        gap: 10px;
        align-items: center;
        min-width: 0;
      }
      .invite-avatar {
        border-radius: 50%;
      }
      .invite-skills {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 5px;
      }
      .invite-skills span {
        max-width: 100%;
        padding: 3px 7px;
        overflow: hidden;
        font-size: 10px;
        color: var(--accent);
        text-overflow: ellipsis;
        white-space: nowrap;
        background: color-mix(in srgb, var(--accent) 9%, white);
        border-radius: var(--rounded-lg);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteUserSummaryComponent {
  readonly user = input.required<User>();
  readonly skills = computed(() => this.user().relations?.skills ?? []);
  readonly age = computed(() => {
    const birthday = new Date(this.user().personal?.birthday);
    if (Number.isNaN(birthday.getTime())) return "";
    const now = new Date();
    const beforeBirthday =
      now.getMonth() < birthday.getMonth() ||
      (now.getMonth() === birthday.getMonth() && now.getDate() < birthday.getDate());
    const age = now.getFullYear() - birthday.getFullYear() - Number(beforeBirthday);
    if (age < 0 || age > 120) return "";
    const plural = new Intl.PluralRules("ru").select(age);
    return age + " " + (plural === "one" ? "год" : plural === "few" ? "года" : "лет");
  });
}
