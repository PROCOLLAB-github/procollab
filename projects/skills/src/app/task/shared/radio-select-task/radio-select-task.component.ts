/** @format */

import { Component, EventEmitter, inject, Input, Output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SingleQuestion, SingleQuestionError } from "../../../../models/step.model";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ParseBreaksPipe, YtExtractService } from "@corelib";

@Component({
  selector: "app-radio-select-task",
  standalone: true,
  imports: [CommonModule, ParseBreaksPipe],
  templateUrl: "./radio-select-task.component.html",
  styleUrl: "./radio-select-task.component.scss",
})
export class RadioSelectTaskComponent {
  @Input({ required: true }) data!: SingleQuestion;
  @Input() success = false;
  @Input() hint!: string;
  @Input()
  set error(value: SingleQuestionError | null) {
    this._error.set(value);

    if (value !== null) {
      this.result.set({ answerId: null });
    }
  }

  get error() {
    return this._error();
  }

  @Output() update = new EventEmitter<{ answerId: number }>();

  result = signal<{ answerId: number | null }>({ answerId: null });
  _error = signal<SingleQuestionError | null>(null);

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

    this.description = this.sanitizer.bypassSecurityTrustHtml(this.data.description);
  }

  onSelect(id: number) {
    this.result.set({ answerId: id });

    this.update.emit({ answerId: id });
  }
}
