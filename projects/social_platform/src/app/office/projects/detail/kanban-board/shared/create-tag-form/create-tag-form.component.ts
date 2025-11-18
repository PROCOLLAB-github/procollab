/** @format */

import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Output } from "@angular/core";
import { tagColorsList } from "projects/core/src/consts/lists/tag-colots.list.const";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: "app-create-tag-form",
  templateUrl: "./create-tag-form.component.html",
  styleUrl: "./create-tag-form.component.scss",
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true,
})
export class CreateTagFormComponent {
  @Output() createTag = new EventEmitter<{ name: string; color: string }>();

  private readonly fb = inject(FormBuilder);

  constructor() {
    this.tagForm = this.fb.group({
      tagName: [""],
      tagColor: [tagColorsList[0].color],
    });
  }

  tagForm: FormGroup;
  openPickColors = false;

  get tagColors() {
    return tagColorsList;
  }

  get selectedColor(): string {
    return this.tagForm.get("tagColor")?.value || tagColorsList[0].color;
  }

  selectTagColor(color: string) {
    this.tagForm.patchValue({ tagColor: color });
    this.openPickColors = false;
  }

  confirmCreateTag(event: Event) {
    event.stopPropagation();
    event.preventDefault();

    const { tagName, tagColor } = this.tagForm.value;

    if (!tagName?.trim() || !tagColor) return;

    this.createTag.emit({
      name: tagName,
      color: tagColor,
    });

    this.tagForm.reset({
      tagName: "",
      tagColor: tagColorsList[0].color,
    });
  }
}
