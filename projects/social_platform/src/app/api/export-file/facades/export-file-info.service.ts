/** @format */

import { DestroyRef, inject, Injectable, signal } from "@angular/core";
import { ExportFileService } from "../export-file.service";
import { saveFile } from "@utils/export-file";
import { ProgramDetailMainUIInfoService } from "../../program/facades/detail/ui/program-detail-main-ui-info.service";
import { LoggerService } from "@corelib";
import { AsyncState, failure, initial, loading, success } from "@domain/shared/async-state";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

/** Обрабатывает экспорт файлов программы и состояние загрузки export-кнопок. */
@Injectable()
export class ExportFileInfoService {
  private readonly loggerService = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly exportFileService = inject(ExportFileService);
  private readonly programDetailMainUIInfoService = inject(ProgramDetailMainUIInfoService);

  private readonly program = this.programDetailMainUIInfoService.program;

  readonly loadingExports$ = signal<AsyncState<void>>(initial());

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
          this.loadingExports$.set(failure(`export_file_${err}`));
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
          this.loadingExports$.set(failure(`export_file_${err}`));
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
          this.loadingExports$.set(failure(`export_file_${err}`));
        },
      });
  }

  downloadCalculations(): void {}
}
