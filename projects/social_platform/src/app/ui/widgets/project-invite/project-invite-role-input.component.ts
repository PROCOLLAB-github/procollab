/** @format */

import { ButtonDirective, FieldDirective } from "@uilib";
/** @format */
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Injector,
  input,
  OnInit,
  signal,
} from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { filterProjectRoles } from "@domain/invite/project-role-suggestions";

let nextRoleId = 0;
@Component({
  selector: "app-project-invite-role-input",
  imports: [ButtonDirective, FieldDirective, ReactiveFormsModule],
  templateUrl: "./project-invite-role-input.component.html",
  styleUrl: "./project-invite-role-input.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectInviteRoleInputComponent implements OnInit {
  readonly control = input.required<FormControl<string>>();
  readonly readonly = input(false);
  readonly id = "invite-role-" + ++nextRoleId;
  readonly opened = signal(false);
  readonly query = signal("");
  readonly active = signal(-1);
  readonly suggestions = computed(() => filterProjectRoles(this.query()));
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  ngOnInit(): void {
    this.query.set(this.control().value);
    this.control()
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.query.set(value);
        this.active.set(-1);
      });
  }

  choose(role: string): void {
    this.control().setValue(role);
    this.control().markAsDirty();
    this.opened.set(false);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape" && this.opened() && this.suggestions().length) {
      event.preventDefault();
      event.stopPropagation();
      this.opened.set(false);
      return;
    }
    if (this.readonly()) return;
    const options = this.suggestions();
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      this.opened.set(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      this.active.set(
        options.length
          ? this.active() < 0
            ? step === 1
              ? 0
              : options.length - 1
            : (this.active() + step + options.length) % options.length
          : -1,
      );
      // При открытии с клавиатуры список появится только в следующем рендере.
      afterNextRender(
        () => {
          document
            .getElementById(this.id + "-option-" + this.active())
            ?.scrollIntoView({ block: "nearest" });
        },
        { injector: this.injector },
      );
    } else if (event.key === "Enter" && this.opened() && this.active() >= 0) {
      event.preventDefault();
      this.choose(options[this.active()]);
    }
  }
}
