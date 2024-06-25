/** @format */

import { Component, EventEmitter, Input, OnInit, Output, Sanitizer, inject } from "@angular/core";
import { CommonModule, JsonPipe } from "@angular/common";
import { WriteQuestion } from "../../../../models/step.model";
import { YtExtractService } from "@corelib";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
  selector: "app-write-task",
  standalone: true,
  imports: [CommonModule, JsonPipe],
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
  description = "";
  ngOnInit(): void {
    const res = this.ytExtractService.transform(this.data.description);

    if (res.extractedLink)
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.extractedLink);
    this.description = res.newText;
  }

  // result = signal<{ text: string } | null>(null);

  onKeyUp(event: KeyboardEvent) {
    const target = event.target as HTMLTextAreaElement;

    target.style.height = "0px";
    target.style.height = target.scrollHeight + "px";

    this.update.emit({ text: target.value });
  }
}
