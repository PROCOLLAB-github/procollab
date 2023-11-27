/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { getFormattedFileSize } from "@utils/formatted-file-size";

@Component({
  selector: "app-file-upload-item",
  templateUrl: "./file-upload-item.component.html",
  styleUrl: "./file-upload-item.component.scss",
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
