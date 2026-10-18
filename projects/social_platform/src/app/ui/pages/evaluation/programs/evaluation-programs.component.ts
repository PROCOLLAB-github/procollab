/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { AlertDirective, AvatarComponent, ButtonDirective, FieldDirective } from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { EvaluationStateService } from "@api/program/facades/evaluation-state.service";
import { EvaluationUseCase } from "@api/program/use-cases/evaluation.use-case";
import { EvaluationProgram } from "@domain/program/evaluation-workspace.model";
import { AppRoutes } from "@api/paths/app-routes";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { AuthInfoService } from "@api/auth/facades/auth-info.service";
import { evaluationError } from "@utils/evaluation-workspace";
import { presentationHref } from "@utils/program-case-analytics";

@Component({
  selector: "app-evaluation-programs",
  imports: [
    RouterLink,
    ReactiveFormsModule,
    DatePipe,
    AlertDirective,
    AvatarComponent,
    ButtonDirective,
    FieldDirective,
    ModalComponent,
  ],
  templateUrl: "./evaluation-programs.component.html",
  styleUrl: "./evaluation-programs.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvaluationProgramsComponent implements OnInit {
  readonly state = inject(EvaluationStateService);
  private readonly api = inject(EvaluationUseCase);
  private readonly profile = inject(ProfileInfoService);
  private readonly auth = inject(AuthInfoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly search = new FormControl("", { nonNullable: true });
  readonly query = signal("");
  readonly selected = signal<EvaluationProgram | null>(null);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly accepted = signal(false);
  readonly paths = AppRoutes;
  readonly href = presentationHref;
  readonly joinedCount = computed(
    () => this.state.programs().filter(p => p.status === "joined").length,
  );
  readonly pendingCount = computed(
    () => this.state.programs().filter(p => p.status === "pending").length,
  );
  readonly filtered = computed(() =>
    this.state
      .programs()
      .filter(p =>
        p.name.toLocaleLowerCase("ru").includes(this.query().trim().toLocaleLowerCase("ru")),
      ),
  );
  private handledInvitation: number | null = null;
  ngOnInit(): void {
    if (!this.state.pending()) this.state.reload();
  }
  constructor() {
    this.search.valueChanges.pipe(takeUntilDestroyed()).subscribe(v => this.query.set(v));
    effect(() => {
      const programs = this.state.programs();
      const id = Number(this.route.snapshot.queryParamMap.get("invitation"));
      if (!id || id === this.handledInvitation) return;
      const invitation = programs.find(p => p.invitationId === id && p.status === "pending");
      if (invitation)
        untracked(() => {
          this.handledInvitation = id;
          this.open(invitation);
        });
    });
  }
  initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(n => n[0])
      .join("")
      .toUpperCase();
  }
  open(program: EvaluationProgram): void {
    this.selected.set(program);
    this.error.set(null);
  }
  close(): void {
    if (this.busy()) return;
    this.selected.set(null);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { invitation: null },
      queryParamsHandling: "merge",
      replaceUrl: true,
    });
  }
  accept(): void {
    const id = this.selected()?.invitationId;
    if (!id || this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    this.api
      .acceptOwn(id)
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.selected.set(null);
          this.accepted.set(true);
          this.state.reload();
          this.auth
            .fetchProfile()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: profile => this.profile.applyProfileUpdated(profile),
              error: () => this.profile.invalidateProfile(),
            });
        },
        error: e => this.error.set(evaluationError(e)),
      });
  }
}
