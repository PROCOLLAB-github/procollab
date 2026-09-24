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
  // Единый визуальный бюджет не зависит от длины слов, шрифта и ширины viewport.
  protected readonly visibleSkills = computed(() => this.skills().slice(0, 2));
  protected readonly hiddenCount = computed(() => Math.max(0, this.skills().length - 2));
  protected readonly hiddenNames = computed(() =>
    this.skills()
      .slice(2)
      .map(s => s.name)
      .join(", "),
  );
}
