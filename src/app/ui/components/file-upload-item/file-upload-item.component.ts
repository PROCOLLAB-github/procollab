/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { getFormattedFileSize } from "@utils/formatted-file-size";
import { FileTypePipe } from "../../pipes/file-type.pipe";
import { LoaderComponent } from "../loader/loader.component";
import { IconComponent } from "../icon/icon.component";
import { NgIf, UpperCasePipe } from "@angular/common";

@Component({
    selector: "app-file-upload-item",
    templateUrl: "./file-upload-item.component.html",
    styleUrl: "./file-upload-item.component.scss",
    standalone: true,
    imports: [
        NgIf,
        IconComponent,
        LoaderComponent,
        UpperCasePipe,
        FileTypePipe,
    ],
})
export class FileUploadItemComponent implements OnInit {
  constructor() {}

  @Input() type = "file";
  @Input() name = "";
  @Input() size = 0;
  @Input() link = "";
  @Input() loading = false;
  @Input() error = "";

  @Output() delete = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();

  getFormattedFileSize = getFormattedFileSize;
  ngOnInit(): void {}
}
