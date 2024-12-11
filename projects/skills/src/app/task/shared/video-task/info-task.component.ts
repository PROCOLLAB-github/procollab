/** @format */

import { Component, inject, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { InfoSlide } from "../../../../models/step.model";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ParseBreaksPipe, ParseLinksPipe, YtExtractService } from "@corelib";

@Component({
  selector: "app-info-task",
  standalone: true,
  imports: [CommonModule, ParseLinksPipe, ParseBreaksPipe],
  templateUrl: "./info-task.component.html",
  styleUrl: "./info-task.component.scss",
})
export class InfoTaskComponent {
  @Input({ required: true }) data!: InfoSlide;

  sanitizer = inject(DomSanitizer);
  ytExtractService = inject(YtExtractService);

  videoUrl?: SafeResourceUrl;
  description: any;
  sanitizedFileUrl?: SafeResourceUrl;
  contentType: "gif" | "webp" | "mp4" | string = "";

  ngOnInit(): void {
    const res = this.ytExtractService.transform(this.data.text);
    if (this.data.files.length) {
      this.contentType = this.data.files[0].slice(-3).toLocaleLowerCase();
    }

    if (res.extractedLink)
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.extractedLink);

    if (this.data.files.length) {
      this.sanitizedFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.files[0]);
    }

    this.description = this.sanitizer.bypassSecurityTrustHtml(this.data.description);
  }
}
