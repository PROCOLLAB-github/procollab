/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import { HttpParams } from "@angular/common/http";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { firstValueFrom, Observable } from "rxjs";
import { ApplyProjectToProgramUseCase } from "@api/program/use-cases/apply-project-to-program.use-case";
import { AssignProjectProgramUseCase } from "@api/program/use-cases/assign-project-program";
import { CreateProjectUseCase } from "@api/project/use-cases/create-project.use-case";
import { AppRoutes } from "@api/paths/app-routes";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { ProjectRepositoryPort } from "@domain/project/ports/project.repository.port";
import { Project } from "@domain/project/project.model";
import { Program } from "@domain/program/program.model";
import { AlertDirective, ButtonDirective, ChoiceDirective, FieldDirective } from "@uilib";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { evaluationError } from "@utils/evaluation-workspace";

@Component({
  selector: "app-project-entry",
  imports: [
    AlertDirective,
    ButtonDirective,
    ChoiceDirective,
    FieldDirective,
    ModalComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: "./project-entry.component.html",
  styleUrl: "./project-entry.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectEntryComponent {
  readonly programId = input<number | null>(null);
  readonly projectId = input<number | null>(null);
  readonly leaderId = input<number | null>(null);
  readonly close = output<void>();
  private readonly programs = inject(ProgramRepositoryPort);
  private readonly projects = inject(ProjectRepositoryPort);
  private readonly assign = inject(AssignProjectProgramUseCase);
  private readonly apply = inject(ApplyProjectToProgramUseCase);
  private readonly create = inject(CreateProjectUseCase);
  private readonly router = inject(Router);
  private readonly destroy = inject(DestroyRef);
  readonly paths = AppRoutes;
  readonly name = new FormControl("", {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(256)],
  });
  readonly choices = signal<{ id: number; name: string }[]>([]);
  readonly selection = signal<number | null>(null);
  readonly creating = signal(false);
  readonly loading = signal(false);
  readonly pending = signal(false);
  readonly error = signal<string | null>(null);
  readonly showName = computed(() => this.creating() || (!this.programId() && !this.projectId()));
  readonly heading = computed(() =>
    this.showName()
      ? "Создать проект"
      : this.projectId()
        ? "Выберите программу"
        : "Выберите проект",
  );

  constructor() {
    effect(onCleanup => {
      const projectId = this.projectId(),
        programId = this.programId(),
        leader = this.leaderId();
      if (!projectId && !programId) return;
      this.loading.set(true);
      const source: Observable<{ results: (Project | Program)[] }> = projectId
        ? this.programs.getAll(
            0,
            100,
            new HttpParams().set("participating", "true").set("project_submission", "true"),
          )
        : this.projects.getMy(new HttpParams().set("limit", 100));
      const subscription = source.subscribe({
        next: page =>
          this.choices.set(
            page.results
              .filter(
                row =>
                  !("leader" in row) ||
                  ((!leader || row.leader === leader) &&
                    !row.partnerProgram?.sourceProjectId &&
                    !row.teamPolicy?.isFrozen),
              )
              .map(row => ({ id: row.id, name: row.name })),
          ),
        error: () => {
          this.error.set("Не удалось загрузить список. Откройте окно еще раз.");
          this.loading.set(false);
        },
        complete: () => this.loading.set(false),
      });
      onCleanup(() => subscription.unsubscribe());
    });
  }

  async submit(): Promise<void> {
    if (this.pending()) return;
    if (this.showName() && this.name.invalid) {
      this.name.markAsTouched();
      return;
    }
    const programId = this.programId() ?? this.selection();
    const projectId = this.projectId() ?? this.selection();
    this.pending.set(true);
    this.error.set(null);
    try {
      if (this.showName() && !this.programId()) {
        const created = await firstValueFrom(
          this.create.execute(this.name.value.trim()).pipe(takeUntilDestroyed(this.destroy)),
        );
        if (!created.ok) {
          this.error.set("Не удалось создать проект. Повторите попытку.");
          return;
        }
        this.close.emit();
        await this.router.navigate([this.paths.projects.edit(created.value.id)], {
          queryParams: { editingStep: "main" },
        });
        return;
      }
      if (!programId || (!projectId && !this.showName())) return;
      const result = this.showName()
        ? await firstValueFrom(
            this.apply
              .execute(programId, {
                project: { name: this.name.value.trim() },
                programFieldValues: [],
              })
              .pipe(takeUntilDestroyed(this.destroy)),
          )
        : await firstValueFrom(
            this.assign.execute(projectId!, programId).pipe(takeUntilDestroyed(this.destroy)),
          );
      if (!result.ok) {
        const cause = result.error.cause as {
          error?: { project_id?: number; program_link_id?: number };
        };
        if (cause?.error?.project_id && cause.error.program_link_id) {
          await this.openCopy(cause.error.project_id, cause.error.program_link_id);
          return;
        }
        this.error.set(evaluationError(cause ?? result.error));
        return;
      }
      const copy = result.value;
      await this.openCopy(
        "newProjectId" in copy ? copy.newProjectId : copy.projectId,
        copy.programLinkId,
      );
    } catch {
      if (!this.destroy.destroyed) this.error.set("Не удалось открыть проект. Повторите попытку.");
    } finally {
      if (!this.destroy.destroyed) this.pending.set(false);
    }
  }

  private async openCopy(id: number, link: number): Promise<void> {
    this.close.emit();
    await this.router.navigate([this.paths.projects.edit(id)], {
      queryParams: { editingStep: "additional", programLinkId: link },
    });
  }
}
