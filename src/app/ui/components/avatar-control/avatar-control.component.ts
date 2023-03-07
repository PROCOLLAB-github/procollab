/** @format */

import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { nanoid } from "nanoid";
import { FileService } from "@core/services/file.service";
import { concatMap, map } from "rxjs";

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

  value = "";

  writeValue(address: string) {
    this.value = address;
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

    console.log(this.value);
    const source = this.value
      ? this.fileService.deleteFile(this.value).pipe(
          concatMap(() => this.fileService.uploadFile(files[0])),
          map(r => r["url"])
        )
      : this.fileService.uploadFile(files[0]).pipe(map(r => r.url));

    source.subscribe(this.updateValue.bind(this));
  }

  private updateValue(url: string): void {
    this.loading = false;

    this.onChange(url);
    this.value = url;

    this.onTouch();
  }
}
