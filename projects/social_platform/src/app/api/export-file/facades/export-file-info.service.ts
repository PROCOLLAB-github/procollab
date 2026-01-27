/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { ExportFileService } from "../export-file.service";
import { saveFile } from "@utils/helpers/export-file";
import { ProgramDetailMainUIInfoService } from "../../program/facades/detail/ui/program-detail-main-ui-info.service";
import { Subject, takeUntil } from "rxjs";

@Injectable()
export class ExportFileInfoService {
  private readonly exportFileService = inject(ExportFileService);
  private readonly programDetailMainUIInfoService = inject(ProgramDetailMainUIInfoService);

  private readonly destroy$ = new Subject<void>();

  private readonly program = this.programDetailMainUIInfoService.program;

  readonly loadingExportProjects = signal<boolean>(false);
  readonly loadingExportSubmittedProjects = signal<boolean>(false);
  readonly loadingExportRates = signal<boolean>(false);
  readonly loadingExportCalculations = signal<boolean>(false);

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  downloadProjects(): void {
    this.loadingExportProjects.set(true);

    this.exportFileService
      .exportAllProjects(this.program()!.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: blob => {
          saveFile(blob, "all", this.program()?.name);
          this.loadingExportProjects.set(false);
        },
        error: err => {
          console.error(err);
          this.loadingExportProjects.set(false);
        },
      });
  }

  downloadSubmittedProjects(): void {
    this.loadingExportSubmittedProjects.set(true);

    this.exportFileService
      .exportSubmittedProjects(this.program()!.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: blob => {
          saveFile(blob, "submitted", this.program()?.name);
          this.loadingExportSubmittedProjects.set(false);
        },
        error: () => {
          this.loadingExportSubmittedProjects.set(false);
        },
      });
  }

  downloadRates(): void {
    this.loadingExportRates.set(true);

    this.exportFileService
      .exportProgramRates(this.program()!.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: blob => {
          saveFile(blob, "rates", this.program()?.name);
          this.loadingExportRates.set(false);
        },
        error: () => {
          this.loadingExportRates.set(false);
        },
      });
  }

  downloadCalculations(): void {}
}
