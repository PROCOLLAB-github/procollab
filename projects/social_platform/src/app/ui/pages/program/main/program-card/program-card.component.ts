/** @format */

import { ButtonDirective, IconComponent } from "@uilib";
import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";
import { DatePipe, NgClass, NgTemplateOutlet } from "@angular/common";
import { RouterLink } from "@angular/router";
import { ProgramImageFraming } from "@domain/program/program-image-framing.model";
import { AppRoutes } from "@api/paths/app-routes";

/** Shared saved identity for the public catalog and organizer cards. */
export interface ProgramCardData {
  id: number;
  name: string;
  shortDescription?: string | null;
  imageAddress?: string | null;
  imageFraming?: ProgramImageFraming | null;
  datetimeRegistrationEnds: string | null;
  datetimeStarted: string | null;
  datetimeFinished: string | null;
  isUserMember?: boolean;
  draft?: boolean;
}

/** Карточка программы с краткой информацией для списков. */
@Component({
  selector: "app-program-card",
  templateUrl: "./program-card.component.html",
  styleUrl: "./program-card.component.scss",
  imports: [
    AvatarComponent,
    ButtonDirective,
    DatePipe,
    IconComponent,
    NgClass,
    NgTemplateOutlet,
    RouterLink,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramCardComponent {
  protected readonly paths = AppRoutes;
  readonly program = input.required<ProgramCardData>();
  readonly management = input(false);
  private readonly registrationDeadline = computed(() =>
    Date.parse(this.program().datetimeRegistrationEnds ?? ""),
  );

  private readonly fullDate = new Intl.DateTimeFormat("ru-RU", { dateStyle: "long" });
  private readonly dayAndMonth = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  });

  protected readonly programDates = computed(() => {
    const { datetimeStarted, datetimeFinished } = this.program();
    const started = Date.parse(datetimeStarted ?? "");
    const finished = Date.parse(datetimeFinished ?? "");
    if (Number.isFinite(started) && Number.isFinite(finished) && finished >= started) {
      const start = new Date(started);
      const end = new Date(finished);
      const endLabel = this.formatFullDate(end);
      if (start.toDateString() === end.toDateString()) return endLabel;
      if (start.getFullYear() !== end.getFullYear()) {
        return `${this.formatFullDate(start)} – ${endLabel}`;
      }
      return start.getMonth() === end.getMonth()
        ? `${start.getDate()}–${endLabel}`
        : `${this.dayAndMonth.format(start)} – ${endLabel}`;
    }
    return datetimeStarted || datetimeFinished ? "Сроки заполнены не полностью" : "Сроки не заданы";
  });

  readonly registrationState = computed(() => {
    if (this.management() && this.program().draft) return "draft";
    const deadline = this.registrationDeadline();
    if (deadline < Date.now()) return "ended";
    if (!this.management() && this.program().isUserMember) return "participating";
    return Number.isFinite(deadline) ? "actual" : "not-set";
  });

  private formatFullDate(date: Date): string {
    return this.fullDate.format(date).replace(/\sг\.$/u, "\u00a0г.");
  }
}
