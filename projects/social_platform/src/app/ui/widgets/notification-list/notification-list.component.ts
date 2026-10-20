/** @format */
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AsyncPipe, DatePipe } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Notification } from "@domain/other/notification.model";
import { NotificationService } from "@ui/services/notification/notification.service";

@Component({
  selector: "app-notification-list",
  imports: [AsyncPipe, DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` @if (service.failed()) {
      <p role="status">Не удалось обновить уведомления. Повторим автоматически.</p>
    }
    <ul aria-label="Уведомления программ">
      @for (notice of service.notifications | async; track notice.id) {
        <li [class.unread]="!notice.readAt">
          @if (notice.kind === "registration_connection") {
            <a
              [href]="
                '/admin/partner_programs/programregistration/' + notice.registrationId + '/change/'
              "
              target="_blank"
              rel="noopener noreferrer"
              (click)="service.read(notice)"
              >{{ notice.text }}</a
            >
          } @else if (notice.kind === "program_attention") {
            <a [routerLink]="reminderRoute(notice)" (click)="service.read(notice)">{{
              notice.text
            }}</a>
          } @else {
            <a
              [routerLink]="['/office/program', notice.programId, 'management', 'experts']"
              (click)="service.read(notice)"
              >{{ notice.text }}</a
            >
          }
          <div>
            <time [attr.datetime]="notice.createdAt"
              >{{ notice.createdAt | date: "dd.MM.yyyy HH:mm" : "+0300" }} МСК</time
            >
            @if (!notice.readAt) {
              <button
                type="button"
                [disabled]="service.reading() !== null"
                (click)="service.read(notice)"
              >
                Отметить прочитанным
              </button>
            }
          </div>
        </li>
      }
    </ul>`,
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
      padding: 12px;
      margin-bottom: 12px;
      border: 1px solid var(--medium-grey-for-outline);
      border-radius: 10px;
    }
    li.unread {
      border-color: var(--accent);
    }
    a {
      display: block;
      font-size: 12px;
      line-height: 1.5;
      color: var(--black);
      overflow-wrap: anywhere;
    }
    div {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 12px;
      align-items: center;
      margin-top: 8px;
    }
    time,
    p {
      font-size: 11px;
      color: var(--grey-for-text);
    }
    button {
      padding: 4px 0;
      font: inherit;
      font-size: 11px;
      color: var(--accent);
      cursor: pointer;
      background: transparent;
      border: 0;
    }
    button:focus-visible,
    a:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 3px;
    }
    @media (max-width: 999px) {
      button {
        min-height: 44px;
      }
    }
  `,
})
export class NotificationListComponent {
  readonly service = inject(NotificationService);
  protected reminderRoute(notice: Notification): (string | number)[] {
    const route: (string | number)[] = ["/office/program", notice.programId];
    if (notice.category === "projects-awaiting-evaluation") route.push("projects-rating");
    else if (notice.category === "participants-without-team") route.push("members");
    return route;
  }
}
