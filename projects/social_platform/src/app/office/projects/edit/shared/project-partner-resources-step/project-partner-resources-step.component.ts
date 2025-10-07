/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ErrorMessage } from "@error/models/error-message";
import { IconComponent } from "@uilib";
import { ProjectPartnerService } from "../../services/project-partner.service";
import { ProjectResourceService } from "../../services/project-resources.service";
import { ButtonComponent, InputComponent, SelectComponent } from "@ui/components";
import { Subscription } from "rxjs";
import { ControlErrorPipe } from "@corelib";
import { TextareaComponent } from "@ui/components/textarea/textarea.component";

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
  private readonly projectPartnerService = inject(ProjectPartnerService);
  private readonly projectResourceService = inject(ProjectResourceService);
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

  get resoruceType() {
    return this.projectResourceService.resoruceType;
  }

  get resoruceDescription() {
    return this.projectResourceService.resoruceDescription;
  }

  get resourcePartner() {
    return this.projectResourceService.resourcePartner;
  }

  get partners() {
    return this.projectPartnerService.partners;
  }

  get partnerName() {
    return this.projectPartnerService.partnerName;
  }

  get partnerINN() {
    return this.projectPartnerService.partnerINN;
  }

  get partnerMention() {
    return this.projectPartnerService.partnerMention;
  }

  get partnerProfileLink() {
    return this.projectPartnerService.partnerProfileLink;
  }

  get hasPartners() {
    return this.partners.length > 0;
  }

  get hasResources() {
    return this.resources.length > 0;
  }

  /**
   * Добавление партнера
   */
  addPartner(
    partnerName?: string,
    partnerINN?: string,
    partnerMention?: string,
    partnerProfileLink?: string
  ): void {
    this.partners.push(
      this.fb.group({
        partnerName: [partnerName, [Validators.required]],
        partnerINN: [partnerINN, [Validators.required]],
        partnerMention: [partnerMention, [Validators.required]],
        partnerProfileLink: [partnerProfileLink, Validators.required],
      })
    );

    this.projectPartnerService.addPartner(
      partnerName,
      partnerINN,
      partnerMention,
      partnerProfileLink
    );
  }

  /**
   * Удаление партнера
   * @param index - индекс партнера
   */
  removePartner(index: number, partnersId: number) {
    this.projectPartnerService.removePartner(index);
    // TODO: ручка на удаление партнера
  }

  /**
   * Добавление ресурса
   */
  addResource(resoruceType?: string, resoruceDescription?: string, resourcePartner?: string): void {
    this.resources.push(
      this.fb.group({
        resoruceType: [resoruceType, [Validators.required]],
        resoruceDescription: [resoruceDescription, [Validators.required]],
        resourcePartner: [resourcePartner, [Validators.required]],
      })
    );

    this.projectResourceService.addPResource(resoruceType, resoruceDescription, resourcePartner);
  }

  /**
   * Удаление ресурса
   * @param index - индекс ресурса
   */
  removeResource(index: number, resource: number) {
    this.projectResourceService.removeResource(index);
    // TODO: ручка на удаление ресурса
  }
}
