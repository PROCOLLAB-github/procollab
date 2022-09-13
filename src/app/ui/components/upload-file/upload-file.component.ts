/** @format */

import { Component, forwardRef, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { FileService } from "../../../core/services/file.service";
import { nanoid } from "nanoid";

@Component({
  selector: "app-upload-file",
  templateUrl: "./upload-file.component.html",
  styleUrls: ["./upload-file.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UploadFileComponent),
      multi: true,
    },
  ],
})
export class UploadFileComponent implements OnInit, ControlValueAccessor {
  constructor(private fileService: FileService) {}

  ngOnInit(): void {}

  controlId = nanoid(3);

  value = "";
  writeValue(url: string) {
    this.value = url;
  }

  onTouch: () => void = () => {};
  registerOnTouched(fn: any) {
    this.onTouch = fn;
  }

  onChange: (url: string) => void = () => {};
  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  loading = false;

  onUpdate(event: Event) {
    const files = (event.currentTarget as HTMLInputElement).files;
    if (!files?.length) {
      return;
    }

    this.loading = true;

    this.fileService.uploadFile(files[0]).subscribe(res => {
      this.loading = false;

      this.value = res.url;
      this.onChange(res.url);
    });
  }
}
