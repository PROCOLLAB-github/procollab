/** @format */

import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ExcludeQuestion, ExcludeQuestionResponse } from "../../../../models/step.model";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ParseBreaksPipe, YtExtractService } from "@corelib";

@Component({
  selector: "app-exclude-task",
  standalone: true,
  imports: [CommonModule, ParseBreaksPipe],
  templateUrl: "./exclude-task.component.html",
  styleUrl: "./exclude-task.component.scss",
})
export class ExcludeTaskComponent implements OnInit {
  @Input({ required: true }) data!: ExcludeQuestion;
  @Input() hint!: string;
  @Output() update = new EventEmitter<number[]>();

  @Input() success = false;
  @Input()
  set error(value: ExcludeQuestionResponse | null) {
    this._error.set(value);

    value !== null && this.result.set([]);
  }

  get error() {
    return this._error();
  }

  result = signal<number[]>([]);
  _error = signal<ExcludeQuestionResponse | null>(null);

  sanitizer = inject(DomSanitizer);
  ytExtractService = inject(YtExtractService);

  videoUrl?: SafeResourceUrl;
  description = "";
  sanitizedFileUrl?: SafeResourceUrl;

  onSelect(id: number) {
    if (this.result().includes(id)) {
      this.result.set(this.result().filter(i => i !== id));
    } else {
      this.result.set([...this.result(), id]);
    }

    this.update.emit(this.result());
  }

  ngOnInit(): void {
    const res = this.ytExtractService.transform(this.data.description);

    if (res.extractedLink)
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.extractedLink);

    if (this.data.files.length) {
      this.sanitizedFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.files[0]);
    }

    this.description = res.newText;
  }
}
