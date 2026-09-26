/** @format */
import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { YearsFromBirthdayPipe } from "@corelib";
import { User } from "@domain/auth/user.model";
import { AppRoutes } from "@api/paths/app-routes";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";

/** Карточка каталога участников; не меняет карточки команды и права внутри проекта. */
@Component({
  selector: "app-member-card",
  imports: [AvatarComponent, RouterLink, YearsFromBirthdayPipe],
  templateUrl: "./member-card.component.html",
  styleUrl: "./member-card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberCardComponent {
  readonly member = input.required<User>();
  protected readonly AppRoutes = AppRoutes;
  protected readonly name = computed(() =>
    [this.member().firstName, this.member().lastName].filter(Boolean).join(" "),
  );
  protected readonly skills = computed(() => this.member().relations?.skills ?? []);
  // Основной навык берём из порядка API: ширина карточки не меняет выбор и число скрытых навыков.
  protected readonly primarySkill = computed(() => this.skills()[0]);
  protected readonly hiddenCount = computed(() => Math.max(0, this.skills().length - 1));
  protected readonly hiddenNames = computed(() =>
    this.skills()
      .slice(1)
      .map(s => s.name)
      .join(", "),
  );
}
