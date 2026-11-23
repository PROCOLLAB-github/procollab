/** @format */

import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { ExportFileService } from "../export-file.service";
import { saveFile } from "@utils/export-file";
import { ProgramDetailMainUIInfoService } from "../../program/facades/detail/ui/program-detail-main-ui-info.service";
import { LoggerService } from "@corelib";
import { AsyncState, failure, initial, loading, success } from "@domain/shared/async-state";
import { SnackbarService } from "@domain/shared/snackbar.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/** Обрабатывает экспорт файлов программы и состояние загрузки export-кнопок. */
@Injectable()
export class ExportFileInfoService {
  private readonly loggerService = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackbar = inject(SnackbarService);

  private readonly exportFileService = inject(ExportFileService);
  private readonly programDetailMainUIInfoService = inject(ProgramDetailMainUIInfoService);

  private readonly program = this.programDetailMainUIInfoService.program;

  readonly loadingExports$ = signal<AsyncState<void>>(initial());

  downloadProgram(): void {
    const program = this.program();
    if (!program || this.loadingExports$().status === "loading") return;
    this.loadingExports$.set(loading());
    this.exportFileService
      .exportProgram(program.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => {
          saveFile(blob, "program", program.name);
          this.loadingExports$.set(success(undefined));
        },
        error: () => this.exportFailed("program_export_failed"),
      });
  }

  downloadProjects(): void {
    this.loadingExports$.set(loading());

    this.exportFileService
      .exportAllProjects(this.program()!.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => {
          saveFile(blob, "all", this.program()?.name);
          this.loadingExports$.set(success(undefined));
        },
        error: err => {
          this.loggerService.error(err);
          this.exportFailed(`export_file_${err}`);
        },
      });
  }

  downloadSubmittedProjects(): void {
    this.loadingExports$.set(loading());

    this.exportFileService
      .exportSubmittedProjects(this.program()!.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => {
          saveFile(blob, "submitted", this.program()?.name);
          this.loadingExports$.set(success(undefined));
        },
        error: err => {
          this.exportFailed(`export_file_${err}`);
        },
      });
  }

  downloadRates(): void {
    this.loadingExports$.set(loading());

    this.exportFileService
      .exportProgramRates(this.program()!.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => {
          saveFile(blob, "rates", this.program()?.name);
          this.loadingExports$.set(success(undefined));
        },
        error: err => {
          this.exportFailed(`export_file_${err}`);
        },
      });
  }

  downloadCalculations(): void {}

  private exportFailed(code: string): void {
    this.loadingExports$.set(failure(code));
    this.snackbar.error("Не удалось подготовить выгрузку. Повторите попытку.");
  }
}
