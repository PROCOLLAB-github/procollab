/** @format */

import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { IconComponent } from "@ui/components";
import { ControlErrorPipe } from "@corelib";
import { ErrorMessage } from "projects/core/src/lib/models/error/error-message";
import { tagColors } from "projects/core/src/consts/other/tag-colors.const";
import { KanbanIcons } from "projects/core/src/consts/other/kanban-icons.const";

@Component({
  selector: "app-create-board-form",
  templateUrl: "./create-board-form.component.html",
  styleUrl: "./create-board-form.component.scss",
  imports: [CommonModule, ReactiveFormsModule, ControlErrorPipe, IconComponent],
  standalone: true,
})
export class CreateBoardFormComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);

  constructor() {
    this.createBoardForm = this.fb.group({
      title: ["", [Validators.required, Validators.maxLength(20)]],
      description: [null, Validators.maxLength(200)],
      color: [null],
      icon: [null],
    });
  }

  get tagColors() {
    return tagColors;
  }

  get kanbanIcons() {
    return KanbanIcons;
  }

  createBoardForm: FormGroup;
  errorMessage = ErrorMessage;
  subscriptions: Subscription[] = [];

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions.forEach($ => $.unsubscribe());
  }

  pickOption(control: "color" | "icon", value: string): void {
    this.createBoardForm.patchValue({ [control]: value });
  }

  private resetForm(): void {
    this.createBoardForm.reset({
      title: "",
      description: null,
      color: null,
      icon: null,
    });
  }
}
