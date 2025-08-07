/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormArray, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { InputComponent, ButtonComponent } from "@ui/components";
import { LinkCardComponent } from "@office/shared/link-card/link-card.component";
import { ControlErrorPipe } from "@corelib";
import { ErrorMessage } from "@error/models/error-message";
import { ProjectContactsService } from "../../services/project-contacts.service";
import { ProjectFormService } from "../../services/project-form.service";
import { IconComponent } from "@uilib";

@Component({
  selector: "app-project-contacts-step",
  templateUrl: "./project-contacts-step.component.html",
  styleUrl: "./project-contacts-step.component.scss",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    IconComponent,
    ButtonComponent,
    LinkCardComponent,
    ControlErrorPipe,
  ],
})
export class ProjectContactsStepComponent {
  private readonly projectContactsService = inject(ProjectContactsService);
  private readonly projectFormService = inject(ProjectFormService);
  readonly errorMessage = ErrorMessage;

  // Получаем форму из сервиса
  get projectForm(): FormGroup {
    return this.projectFormService.getForm();
  }

  // Получаем поля из формы из сервиса
  get linksItems() {
    return this.projectContactsService.linksItems;
  }

  get link() {
    return this.projectContactsService.link;
  }

  get links(): FormArray {
    return this.projectContactsService.links;
  }

  /**
   * Добавление ссылки
   */
  addLink(): void {
    this.projectContactsService.addLink();
  }

  /**
   * Редактирование ссылки
   * @param index - индекс ссылки
   */
  editLink(index: number): void {
    this.projectContactsService.editLink(index);
  }

  /**
   * Удаление ссылки
   * @param index - индекс ссылки
   */
  removeLink(index: number): void {
    this.projectContactsService.removeLink(index);
  }
}
