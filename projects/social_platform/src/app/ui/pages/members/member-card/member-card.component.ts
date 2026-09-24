/** @format */
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { YearsFromBirthdayPipe } from "@corelib";
import { User } from "@domain/auth/user.model";
import { AppRoutes } from "@api/paths/app-routes";
import { AvatarComponent } from "@ui/primitives/avatar/avatar.component";

/** Сколько плашек помещается в две строки с резервом под точный счётчик скрытых навыков. */
export function fitMemberSkills(width: number, widths: number[], counterWidth: number): number {
  if (width <= 0) return 0;
  let row = 1,
    used = 0,
    best = 0;
  for (let i = 0; i < widths.length; i++) {
    const chip = Math.min(widths[i], width);
    const gap = used ? 4 : 0;
    if (used + gap + chip > width + 0.5) {
      row++;
      used = chip;
    } else used += gap + chip;
    if (row > 2) break;
    if (i === widths.length - 1) return widths.length;
    if (row < 2 || used + 4 + counterWidth <= width + 0.5) best = i + 1;
  }
  return best;
}

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
  protected readonly visibleCount = signal(0);
  protected readonly hiddenCount = computed(() =>
    Math.max(0, this.skills().length - this.visibleCount()),
  );
  protected readonly hiddenNames = computed(() =>
    this.skills()
      .slice(this.visibleCount())
      .map(s => s.name)
      .join(", "),
  );
  private readonly measureElement = viewChild<ElementRef<HTMLElement>>("measureElement");

  constructor() {
    // Ширина слова зависит от шрифта: измеряем те же плашки, не гадаем по числу символов.
    // Невидимый слой не занимает место, не попадает в accessibility tree и не содержит действий.
    afterRenderEffect(onCleanup => {
      this.skills();
      const element = this.measureElement()?.nativeElement;
      if (!element) return;
      let active = true;
      const measure = () => {
        if (!active) return;
        const chips = Array.from(element.querySelectorAll<HTMLElement>(".member-card__skill"));
        const counter = element.querySelector<HTMLElement>(".member-card__more")!;
        this.visibleCount.set(
          fitMemberSkills(
            element.clientWidth,
            chips.map(c => c.getBoundingClientRect().width),
            counter.getBoundingClientRect().width,
          ),
        );
      };
      measure();
      const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
      observer?.observe(element);
      void document.fonts?.ready.then(measure);
      document.fonts?.addEventListener("loadingdone", measure);
      onCleanup(() => {
        active = false;
        observer?.disconnect();
        document.fonts?.removeEventListener("loadingdone", measure);
      });
    });
  }
}
