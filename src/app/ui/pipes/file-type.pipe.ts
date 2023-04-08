/** @format */

import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "fileType",
})
export class FileTypePipe implements PipeTransform {
  private readonly typeMap: Record<string, string> = {
    // images
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/wepb": "webp",
    "image/svg+xml": "svg",
    "image/*": "image",
    // media
    "video/mp4": "mp4",
    "audio/mpeg": "mp3",
    // docs,
    "application/pdf": "pdf",
    "application/doc": "doc",
    "text/plain": "txt",
    "text/csv": "csv",
    "application/vnd.ms-powerpoint": "ppt",
    // arch
    "application/zip": "arch",
    "*": "file",
  };

  transform(value: string): string {
    if (value.includes("image/")) {
      return this.typeMap[value] ?? this.typeMap["image/*"];
    }
    return this.typeMap[value] ?? this.typeMap["*"];
  }
}
