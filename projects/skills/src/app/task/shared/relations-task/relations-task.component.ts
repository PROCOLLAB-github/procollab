/** @format */

import {
  Component,
  computed,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ConnectQuestion,
  ConnectQuestionRequest,
  ConnectQuestionResponse,
} from "../../../../models/step.model";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-relations-task",
  standalone: true,
  imports: [CommonModule, ParseBreaksPipe, ParseLinksPipe],
  templateUrl: "./relations-task.component.html",
  styleUrl: "./relations-task.component.scss",
})
export class RelationsTaskComponent implements OnInit {
  @Input({ required: true }) data!: ConnectQuestion;
  @Input() hint!: string;
  protected readonly Array = Array;

  _error = signal<ConnectQuestionResponse | null>(null);

  @Input() success = false;

  @Input()
  set error(error: ConnectQuestionResponse | null) {
    this._error.set(error);

    if (error !== null) {
      this.result.set([]);
      this.selectedLeftId.set(null);
    }
  }

  get error() {
    return this._error();
  }

  result = signal<ConnectQuestionRequest>([]);
  resultLeft = computed(() => this.result().map(r => r.leftId));
  resultRight = computed(() => this.result().map(r => r.rightId));

  description: any;
  sanitizer = inject(DomSanitizer);

  isImageGrid = computed(() => {
    return this.data.connectRight.every(itm => !!itm.file);
  });

  ngOnInit() {
    this.description = this.sanitizer.bypassSecurityTrustHtml(this.data.description);
  }

  @Output() update = new EventEmitter<ConnectQuestionRequest>();

  selectedLeftId = signal<number | null>(null);

  onSelectLeft(id: number) {
    const idx = this.result().findIndex(r => r.leftId === id);

    if (idx === -1) {
      this.selectedLeftId.set(id);
      return;
    }

    this.selectedLeftId.set(null);
  }

  onSelectRight(id: number) {
    const idx = this.result().findIndex(r => r.rightId === id);

    if (idx === -1) {
      if (this.selectedLeftId() === null) return;

      this.result.update(r => {
        const newResult = JSON.parse(JSON.stringify(r));
        newResult.push({ leftId: this.selectedLeftId(), rightId: id });

        return newResult;
      });
    } else {
      this.result.update(r => {
        const newResult = JSON.parse(JSON.stringify(r));
        newResult.splice(idx, 1);

        return newResult;
      });
      this.selectedLeftId.set(null);
    }

    this.update.emit(this.result());
  }
}
