/** @format */

import { Component, EventEmitter, Input, OnInit, Output, Sanitizer, inject } from "@angular/core";
import { CommonModule, JsonPipe } from "@angular/common";
import { WriteQuestion } from "../../../../models/step.model";
import { ParseBreaksPipe, YtExtractService } from "@corelib";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
  selector: "app-write-task",
  standalone: true,
  imports: [CommonModule, JsonPipe, ParseBreaksPipe],
  templateUrl: "./write-task.component.html",
  styleUrl: "./write-task.component.scss",
})
export class WriteTaskComponent implements OnInit {
  @Input({ required: true }) data!: WriteQuestion;
  @Output() update = new EventEmitter<{ text: string }>();

  @Input() success = false;

  sanitizer = inject(DomSanitizer);
  ytExtractService = inject(YtExtractService);

  videoUrl?: SafeResourceUrl;
  description: any;
  sanitizedFileUrl?: SafeResourceUrl;

  ngOnInit(): void {
    const res = this.ytExtractService.transform(this.data.description);

    if (res.extractedLink)
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.extractedLink);

    if (this.data.files.length) {
      this.sanitizedFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.files[0]);
    }

    this.description = this.sanitizer.bypassSecurityTrustHtml(this.data.text);
  }

  // result = signal<{ text: string } | null>(null);

  onKeyUp(event: KeyboardEvent) {
    const target = event.target as HTMLTextAreaElement;

    target.style.height = "0px";
    target.style.height = target.scrollHeight + "px";

    this.update.emit({ text: target.value });
  }
}
