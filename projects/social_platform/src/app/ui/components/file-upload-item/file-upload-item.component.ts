/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FileTypePipe } from "@ui/pipes/file-type.pipe";
import { LoaderComponent } from "../loader/loader.component";
import { IconComponent } from "@ui/components";
import { UpperCasePipe } from "@angular/common";
import { FormatedFileSizePipe } from "@core/pipes/formatted-file-size.pipe";

@Component({
  selector: "app-file-upload-item",
  templateUrl: "./file-upload-item.component.html",
  styleUrl: "./file-upload-item.component.scss",
  standalone: true,
  imports: [IconComponent, LoaderComponent, UpperCasePipe, FileTypePipe, FormatedFileSizePipe],
})
export class FileUploadItemComponent implements OnInit {
  constructor() { }

  @Input() type = "file";
  @Input() name = "";
  @Input() size = 0;
  @Input() link = "";
  @Input() loading = false;
  @Input() error = "";

  @Output() delete = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();

  ngOnInit(): void { }
}
