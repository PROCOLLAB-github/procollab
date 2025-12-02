/** @format */

import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { tagColors } from "projects/core/src/consts/other/tag-colors.const";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { TagDto } from "../../models/dto/tag.model.dto";

@Component({
  selector: "app-create-tag-form",
  templateUrl: "./create-tag-form.component.html",
  styleUrl: "./create-tag-form.component.scss",
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true,
})
export class CreateTagFormComponent implements OnInit, OnChanges {
  @Input() editingTag: TagDto | null = null;
  @Output() createTag = new EventEmitter<TagDto>();
  @Output() updateTag = new EventEmitter<TagDto>();

  private readonly fb = inject(FormBuilder);

  constructor() {
    this.tagForm = this.fb.group({
      tagName: ["", [Validators.required, Validators.maxLength(30)]],
      tagColor: [tagColors[0].name, [Validators.required]],
    });
  }

  tagForm: FormGroup;
  openPickColors = false;

  get tagColors() {
    return tagColors;
  }

  get selectedColor(): string {
    const colorName = this.tagForm.get("tagColor")?.value;
    const found = tagColors.find(c => c.name === colorName);
    return found ? found.color : tagColors[0].color;
  }

  get isEditMode(): boolean {
    return !!this.editingTag;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["editingTag"]) {
      this.initFormFromEditingTag();
    }
  }

  ngOnInit(): void {
    this.initFormFromEditingTag();
  }

  selectTagColor(colorName: string) {
    this.tagForm.patchValue({ tagColor: colorName });
    this.openPickColors = false;
  }

  confirmCreateTag(event: Event) {
    event.stopPropagation();
    event.preventDefault();

    const { tagName, tagColor } = this.tagForm.value;
    const tagData: TagDto = {
      name: tagName,
      color: tagColor,
    };

    if (!tagName?.trim() || !tagColor) return;

    if (this.isEditMode && this.editingTag?.id) {
      this.updateTag.emit({ ...tagData, id: this.editingTag.id });
    } else {
      this.createTag.emit(tagData);
    }
    this.resetForm();
  }

  private resetForm(): void {
    this.tagForm.reset({
      tagName: "",
      tagColor: tagColors[0].name,
    });
  }

  private initFormFromEditingTag() {
    if (this.editingTag) {
      this.tagForm.patchValue({
        tagName: this.editingTag.name,
        tagColor: this.editingTag.color,
      });
    } else {
      this.resetForm();
    }
  }
}
