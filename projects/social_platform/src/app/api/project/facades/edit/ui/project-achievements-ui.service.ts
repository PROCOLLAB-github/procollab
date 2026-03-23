/** @format */

import { inject, Injectable, signal } from "@angular/core";
import { ProjectFormService } from "../project-form.service";
import { ToggleFieldsInfoService } from "../../../../toggle-fields/toggle-fields-info.service";

@Injectable({
  providedIn: "root",
})
export class ProjectAchievementUIService {
  private readonly projectFormService = inject(ProjectFormService);
  private readonly toggleFieldsInfoService = inject(ToggleFieldsInfoService);

  private readonly editIndex = this.projectFormService.editIndex;
  private readonly projectForm = this.projectFormService.getForm();

  /**
   * Скрывает поля ввода и очищает их
   */
  hideFields(): void {
    this.toggleFieldsInfoService.hideFields();
    this.clearInputFields();
  }

  private clearInputFields(): void {
    this.projectForm.get("achievementsName")?.reset();
    this.projectForm.get("achievementsName")?.setValue("");

    if (this.editIndex() !== null) {
      this.projectFormService.editIndex.set(null);
    }
  }
}
