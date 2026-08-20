/** @format */

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
} from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ValidationService } from "@corelib";
import { nanoid } from "nanoid";
import { AutosizeModule } from "ngx-autosize";
import { TextareaComponent } from "@ui/primitives/textarea/textarea.component";
import { ImgCardComponent } from "@ui/primitives/img-card/img-card.component";
import { FileUploadItemComponent } from "@ui/primitives/file-upload-item/file-upload-item.component";
import { IconComponent } from "@ui/primitives";
import { FileService } from "@core/lib/services/file/file.service";

type ImageUploadItem = {
  id: string;
  src: string;
  loading: boolean;
  error: boolean;
  tempFile: File | null;
};

type FileUploadItem = {
  id: string;
  loading: boolean;
  error: string;
  src: string;
  tempFile: File;
};

@Component({
  selector: "app-news-form",
  templateUrl: "./news-form.component.html",
  styleUrl: "./news-form.component.scss",
  imports: [
    ReactiveFormsModule,
    AutosizeModule,
    IconComponent,
    FileUploadItemComponent,
    ImgCardComponent,
    TextareaComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsFormComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly fb: FormBuilder,
    private readonly validationService: ValidationService,
    private readonly fileService: FileService,
  ) {
    this.messageForm = this.fb.group({
      text: ["", [Validators.required]],
    });

    effect(() => {
      if (this.pending()) {
        this.messageForm.disable({ emitEvent: false });
      } else {
        this.messageForm.enable({ emitEvent: false });
      }
    });
  }

  readonly addNews = output<{ text: string; files: string[] }>();

  readonly pending = input(false);

  ngOnInit(): void {}

  messageForm: FormGroup;

  readonly maxTextLength = 15940;

  readonly imagesList = signal<ImageUploadItem[]>([]);

  readonly filesList = signal<FileUploadItem[]>([]);

  readonly isSubmitDisabled = computed(
    () => this.pending() || this.isTextOverflow || this.hasBlockedAttachments(),
  );

  get isTextOverflow(): boolean {
    return (this.messageForm.get("text")?.value?.length ?? 0) > this.maxTextLength;
  }

  onSubmit() {
    if (this.isSubmitDisabled()) return;
    if (!this.validationService.getFormValidation(this.messageForm)) {
      return;
    }

    this.addNews.emit({
      ...this.messageForm.value,
      files: this.getUploadedFileUrls(),
    });
  }

  onResetForm() {
    this.imagesList.set([]);
    this.filesList.set([]);
    this.messageForm.reset();
  }

  uploadFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = file.type.split("/")[0];

      if (fileType === "image") {
        this.uploadImageFile(file);
      } else {
        this.uploadRegularFile(file);
      }
    }
  }

  onInputFiles(event: Event) {
    const files = (event.currentTarget as HTMLInputElement).files;
    if (!files) return;

    this.uploadFiles(files);
  }

  onPaste(event: ClipboardEvent) {
    const files = event.clipboardData?.files;
    if (!files) return;

    this.uploadFiles(files);
  }

  onDeletePhoto(fId: string) {
    const fileObj = this.imagesList().find(f => f.id === fId);
    if (!fileObj) return;

    if (fileObj.src) {
      this.updateImage(fId, { loading: true });
      this.fileService
        .deleteFile(fileObj.src)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.removeImage(fId),
          error: () => {
            this.updateImage(fId, { loading: false });
          },
        });
    } else {
      this.removeImage(fId);
    }
  }

  onDeleteFile(fId: string) {
    const fileObj = this.filesList().find(f => f.id === fId);
    if (!fileObj) return;

    if (fileObj.src) {
      this.updateFile(fId, { loading: true });
      this.fileService
        .deleteFile(fileObj.src)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.removeFile(fId),
          error: () => {
            this.updateFile(fId, { loading: false });
          },
        });
    } else {
      this.removeFile(fId);
    }
  }

  onRetryUpload(id: string) {
    const fileObj = this.imagesList().find(f => f.id === id);
    if (!fileObj || !fileObj.tempFile) return;

    this.updateImage(id, { loading: true, error: false, src: "" });
    this.fileService
      .uploadFile(fileObj.tempFile)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: file => {
          this.updateImage(id, { src: file.url, loading: false, tempFile: null });
        },
        error: () => {
          this.updateImage(id, { error: true, loading: false });
        },
      });
  }

  onRetryFile(id: string) {
    const fileObj = this.filesList().find(f => f.id === id);
    if (!fileObj) return;

    this.updateFile(id, { loading: true, error: "", src: "" });
    this.fileService
      .uploadFile(fileObj.tempFile)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: file => {
          this.updateFile(id, { src: file.url, loading: false });
        },
        error: () => {
          this.updateFile(id, { error: "Ошибка загрузки", loading: false });
        },
      });
  }

  private uploadImageFile(file: File): void {
    const id = nanoid(2);
    const fileObj: ImageUploadItem = {
      id,
      src: "",
      loading: true,
      error: false,
      tempFile: file,
    };

    this.imagesList.update(files => [...files, fileObj]);
    this.fileService
      .uploadFile(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: uploadedFile => {
          this.updateImage(id, {
            src: uploadedFile.url,
            loading: false,
            tempFile: null,
          });
        },
        error: () => {
          this.updateImage(id, { loading: false, error: true });
        },
      });
  }

  private uploadRegularFile(file: File): void {
    const id = nanoid(2);
    const fileObj: FileUploadItem = {
      id,
      loading: true,
      error: "",
      src: "",
      tempFile: file,
    };

    this.filesList.update(files => [...files, fileObj]);
    this.fileService
      .uploadFile(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: uploadedFile => {
          this.updateFile(id, {
            src: uploadedFile.url,
            loading: false,
          });
        },
        error: () => {
          this.updateFile(id, { loading: false, error: "Ошибка загрузки" });
        },
      });
  }

  private updateImage(id: string, changes: Partial<ImageUploadItem>): void {
    this.imagesList.update(files =>
      files.map(file => (file.id === id ? { ...file, ...changes } : file)),
    );
  }

  private updateFile(id: string, changes: Partial<FileUploadItem>): void {
    this.filesList.update(files =>
      files.map(file => (file.id === id ? { ...file, ...changes } : file)),
    );
  }

  private removeImage(id: string): void {
    this.imagesList.update(files => files.filter(file => file.id !== id));
  }

  private removeFile(id: string): void {
    this.filesList.update(files => files.filter(file => file.id !== id));
  }

  private hasBlockedAttachments(): boolean {
    return [...this.imagesList(), ...this.filesList()].some(
      file => file.loading || Boolean(file.error) || !file.src,
    );
  }

  private getUploadedFileUrls(): string[] {
    return [...this.imagesList(), ...this.filesList()]
      .map(file => file.src)
      .filter((src): src is string => Boolean(src));
  }
}
