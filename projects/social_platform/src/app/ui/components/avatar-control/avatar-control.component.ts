/** @format */

import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { nanoid } from "nanoid";
import { FileService } from "@core/services/file.service";
import { catchError, concatMap, map, of } from "rxjs";
import { IconComponent } from "@ui/components";
import { LoaderComponent } from "../loader/loader.component";

@Component({
  selector: "app-avatar-control",
  templateUrl: "./avatar-control.component.html",
  styleUrl: "./avatar-control.component.scss",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AvatarControlComponent),
      multi: true,
    },
  ],
  standalone: true,
  imports: [LoaderComponent, IconComponent],
})
export class AvatarControlComponent implements OnInit, ControlValueAccessor {
  constructor(private fileService: FileService) {}

  @Input() size = 140;
  @Input() error = false;
  @Input() type: "avatar" | "project" = "avatar";

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

    const source = this.value
      ? this.fileService.deleteFile(this.value).pipe(
          catchError(err => {
            console.error(err);
            return of({});
          }),
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
