/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { IconComponent } from "@uilib";
import { ButtonComponent, InputComponent, SelectComponent } from "@ui/components";
import { ControlErrorPipe } from "@corelib";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { optionsListElement } from "@utils/generate-options-list";
import { resourceOptionsList } from "projects/core/src/consts/lists/resource-options-list.const";
import { ProjectsEditInfoService } from "projects/social_platform/src/app/api/project/facades/edit/projects-edit-info.service";
import { ProjectPartnerService } from "projects/social_platform/src/app/api/project/facades/edit/project-partner.service";
import { ProjectResourceService } from "projects/social_platform/src/app/api/project/facades/edit/project-resources.service";

@Component({
  selector: "app-project-partner-resources-step",
  templateUrl: "./project-partner-resources-step.component.html",
  styleUrl: "./project-partner-resources-step.component.scss",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconComponent,
    ButtonComponent,
    InputComponent,
    ControlErrorPipe,
    TextareaComponent,
    SelectComponent,
  ],
})
export class ProjectPartnerResourcesStepComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);

  private readonly projectPartnerService = inject(ProjectPartnerService);
  private readonly projectResourceService = inject(ProjectResourceService);
  private readonly projectsEditInfoService = inject(ProjectsEditInfoService);

  protected readonly projectId = this.projectsEditInfoService.profileId;

  // Получаем форму из сервиса
  protected readonly partnerForm = this.projectPartnerService.getForm();
  protected readonly resourceForm = this.projectResourceService.getForm();

  // Геттеры для удобного доступа к контролам формы
  protected readonly resources = this.projectResourceService.resources;
  protected readonly type = this.projectResourceService.resoruceType;
  protected readonly description = this.projectResourceService.resoruceDescription;
  protected readonly partnerCompany = this.projectResourceService.resourcePartner;
  protected readonly partners = this.projectPartnerService.partners;

  protected readonly name = this.projectPartnerService.partnerName;
  protected readonly inn = this.projectPartnerService.partnerINN;
  protected readonly contribution = this.projectPartnerService.partnerMention;
  protected readonly decisionMaker = this.projectPartnerService.partnerProfileLink;

  protected readonly hasPartners = this.projectPartnerService.hasPartners;
  protected readonly hasResources = this.projectResourceService.hasResources;

  protected readonly resourcesTypeOptions = resourceOptionsList;
  protected readonly errorMessage = ErrorMessage;

  get resourcesCompanyOptions(): optionsListElement[] {
    const partners = this.partners.value || [];

    const partnerOptions: optionsListElement[] = partners.map((partner: any, index: number) => {
      const id = partner?.company?.id ?? partner?.id ?? index;
      const value = partner?.company?.id ?? partner?.id ?? null;
      const label = partner?.name;

      return {
        id,
        value,
        label,
      } as optionsListElement;
    });

    partnerOptions.push({
      id: -1,
      value: "запрос к рынку",
      label: "запрос к рынку",
    });

    return partnerOptions;
  }

  ngOnDestroy(): void {
    this.projectPartnerService.destroy();
    this.projectResourceService.destroy();
  }

  /**
   * Добавление партнера
   */
  addPartner(name?: string, inn?: string, contribution?: string, decisionMaker?: string): void {
    this.partners.push(
      this.fb.group({
        name: [name, [Validators.required]],
        inn: [inn, [Validators.required]],
        contribution: [contribution, [Validators.required]],
        decisionMaker: [decisionMaker, Validators.required],
      })
    );

    this.projectPartnerService.addPartner(name, inn, contribution, decisionMaker);
  }

  /**
   * Удаление партнера
   * @param index - индекс партнера
   */
  removePartner(index: number, partnersId: number) {
    this.projectPartnerService.removePartner(index, partnersId, this.projectId());
  }

  /**
   * Добавление ресурса
   */
  addResource(type?: string, description?: string, partnerCompany?: string): void {
    this.resources.push(
      this.fb.group({
        type: [type, [Validators.required]],
        description: [description, [Validators.required]],
        partnerCompany: [partnerCompany, [Validators.required]],
      })
    );

    this.projectResourceService.addResource(type, description, partnerCompany);
  }

  /**
   * Удаление ресурса
   * @param index - индекс ресурса
   */
  removeResource(index: number, resourceId: number) {
    this.projectResourceService.removeResource(index, resourceId, this.projectId());
  }
}
