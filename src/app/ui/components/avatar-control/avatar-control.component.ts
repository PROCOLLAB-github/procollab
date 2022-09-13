/** @format */

import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { nanoid } from "nanoid";
import { FileService } from "../../../core/services/file.service";

@Component({
  selector: "app-avatar-control",
  templateUrl: "./avatar-control.component.html",
  styleUrls: ["./avatar-control.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AvatarControlComponent),
      multi: true,
    },
  ],
})
export class AvatarControlComponent implements OnInit, ControlValueAccessor {
  constructor(private fileService: FileService) {}

  @Input() size = 140;

  ngOnInit(): void {}

  controlId = nanoid(3);

  placeholderUrl =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfRvoKyPWxl-0EExOVhrqc56QcPcWK-Tloew&usqp=CAU";

  value = "";
  writeValue(address: string) {
    this.value = address || this.placeholderUrl;
  }

  onTouch: () => void = () => {};
  registerOnTouched(fn: any) {
    this.onTouch = fn;
  }

  onChange: (value: string) => void = () => {};
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
      this.onTouch();
      this.onChange(res.url);
      this.value = res.url;
    });
  }
}
