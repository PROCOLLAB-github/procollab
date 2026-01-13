/** @format */

import { inject, Injectable } from "@angular/core";
import { ApiService } from "@corelib";

@Injectable({ providedIn: "root" })
export class ExportFileService {
  private readonly EXPORT_PROGRAM_FILE_URL = "/programs/";
  private readonly EXPORT_PROGRAM_RATES_URL = "/export-rates/";
  private readonly EXPORT_PROGRAM_ALL_PROJECTS_URL = "/export-projects/";
  private readonly EXPORT_PROGRAM_SUBMITTED_PROJECTS_URL = "/export-projects/?only_submitted=1";

  private readonly apiService = inject(ApiService);

  exportProgramRates(programId: number) {
    return this.apiService.getFile(
      `${this.EXPORT_PROGRAM_FILE_URL}${programId}${this.EXPORT_PROGRAM_RATES_URL}`
    );
  }

  exportAllProjects(programId: number) {
    return this.apiService.getFile(
      `${this.EXPORT_PROGRAM_FILE_URL}${programId}${this.EXPORT_PROGRAM_ALL_PROJECTS_URL}`
    );
  }

  exportSubmittedProjects(programId: number) {
    return this.apiService.getFile(
      `${this.EXPORT_PROGRAM_FILE_URL}${programId}${this.EXPORT_PROGRAM_SUBMITTED_PROJECTS_URL}`
    );
  }
}
