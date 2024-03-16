/** @format */
import { Component, Input, OnInit } from "@angular/core";
import { getFormattedFileSize } from "@utils/formatted-file-size";
import { FileTypePipe } from "@ui/pipes/file-type.pipe";
import { IconComponent } from "@ui/components";

@Component({
  selector: "app-file-item",
  templateUrl: "./file-item.component.html",
  styleUrl: "./file-item.component.scss",
  standalone: true,
  imports: [IconComponent, FileTypePipe],
})
export class FileItemComponent implements OnInit {
  constructor() {}

  @Input() type = "file";
  @Input() name = "";
  @Input() size = 0;
  @Input() link = "";

  getFormattedFileSize = getFormattedFileSize;
  ngOnInit(): void {}

  onDownloadFile(): void {
    const link = document.createElement("a");

    link.setAttribute("href", this.link);
    link.setAttribute("download", this.name);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
