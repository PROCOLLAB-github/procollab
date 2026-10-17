/** @format */

import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ButtonComponent } from "@ui/primitives";
import { StateComponent } from "@uilib";
import { ProjectAdditionalService } from "@api/project/facades/edit/project-additional.service";
import { AppRoutes } from "@api/paths/app-routes";
import { ProgramFieldsComponent } from "@ui/widgets/program-fields/program-fields.component";

@Component({
  selector: "app-project-additional-step",
  templateUrl: "./project-additional-step.component.html",
  styleUrl: "./project-additional-step.component.scss",
  imports: [StateComponent, ButtonComponent, RouterLink, ProgramFieldsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectAdditionalStepComponent {
  protected readonly state = inject(ProjectAdditionalService);
  protected readonly additionalForm = this.state.getAdditionalForm();
  protected readonly paths = AppRoutes;
  protected readonly setUploadBusy = (busy: boolean) => this.state.uploading.set(busy);
}
