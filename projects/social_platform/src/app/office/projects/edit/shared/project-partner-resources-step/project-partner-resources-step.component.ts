/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, Input, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ErrorMessage } from "@error/models/error-message";
import { IconComponent } from "@uilib";
import { ProjectPartnerService } from "../../services/project-partner.service";
import { ProjectResourceService } from "../../services/project-resources.service";
import { ButtonComponent, InputComponent, SelectComponent } from "@ui/components";
import { Subscription } from "rxjs";
import { ControlErrorPipe } from "@corelib";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";
import { ProjectService } from "@office/services/project.service";
import { generateOptionsList, optionsListElement } from "@utils/generate-options-list";
import { Partner } from "@office/models/partner.model";

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
  @Input() projectId!: number;

  private readonly projectPartnerService = inject(ProjectPartnerService);
  private readonly projectResourceService = inject(ProjectResourceService);
  private readonly projectService = inject(ProjectService);
  private readonly fb = inject(FormBuilder);

  readonly errorMessage = ErrorMessage;
  private subscription = new Subscription();

  // Получаем форму из сервиса
  get partnerForm(): FormGroup {
    return this.projectPartnerService.getForm();
  }

  get resourceForm(): FormGroup {
    return this.projectResourceService.getForm();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Геттеры для удобного доступа к контролам формы
  get resources() {
    return this.projectResourceService.resources;
  }

  get type() {
    return this.projectResourceService.resoruceType;
  }

  get description() {
    return this.projectResourceService.resoruceDescription;
  }

  get partnerCompany() {
    return this.projectResourceService.resourcePartner;
  }

  get partners() {
    return this.projectPartnerService.partners;
  }

  get name() {
    return this.projectPartnerService.partnerName;
  }

  get inn() {
    return this.projectPartnerService.partnerINN;
  }

  get contribution() {
    return this.projectPartnerService.partnerMention;
  }

  get decisionMaker() {
    return this.projectPartnerService.partnerProfileLink;
  }

  get hasPartners() {
    return this.partners.length > 0;
  }

  get hasResources() {
    return this.resources.length > 0;
  }

  get resourcesCompanyOptions(): optionsListElement[] {
    const partners = this.partners.value || [];

    const partnerOptions: optionsListElement[] = partners.map((partner: any, index: number) => ({
      id: partner.company.id ?? index,
      value: partner.id ?? null,
      label: partner.name,
    }));

    partnerOptions.push({
      id: -1,
      value: "запрос к рынку",
      label: "запрос к рынку",
    });

    return partnerOptions;
  }

  get resourcesTypeOptions(): optionsListElement[] {
    const resourceOptions = [
      {
        id: 1,
        value: "infrastructure",
        label: "Инфраструктурный",
      },
      {
        id: 2,
        value: "staff",
        label: "Кадровый",
      },
      {
        id: 3,
        value: "financial",
        label: "Финансовый",
      },
      {
        id: 4,
        value: "information",
        label: "Информационный",
      },
    ];

    return resourceOptions;
  }

  /**
   * Добавление партнера
   */
  addPartner(name?: string, inn?: string, contribution?: string, decisionMaker?: string): void {
    this.partners.push(
      this.fb.group({
        id: [null],
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
    this.projectPartnerService.removePartner(index);
    this.projectService.deletePartner(this.projectId, partnersId).subscribe();
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
    this.projectResourceService.removeResource(index);
    this.projectService.deleteResource(this.projectId, resourceId).subscribe();
  }
}
