/** @format */

import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { DomSanitizer } from "@angular/platform-browser";
import { fromEvent, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";
import {
  ConnectQuestion,
  ConnectQuestionRequest,
  ConnectQuestionResponse,
} from "../../../../models/step.model";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";

@Component({
  selector: "app-relations-task",
  standalone: true,
  imports: [CommonModule, ParseBreaksPipe, ParseLinksPipe],
  templateUrl: "./relations-task.component.html",
  styleUrls: ["./relations-task.component.scss"],
})
export class RelationsTaskComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input({ required: true }) data!: ConnectQuestion;
  @Input() hint!: string;
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

  protected readonly Array = Array;

  _error = signal<ConnectQuestionResponse | null>(null);

  @Output() update = new EventEmitter<ConnectQuestionRequest>();

  @ViewChild("svgOverlay", { static: true }) svgOverlay!: ElementRef<SVGSVGElement>;
  @ViewChildren("leftItem", { read: ElementRef }) leftItems!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren("rightItem", { read: ElementRef }) rightItems!: QueryList<ElementRef<HTMLElement>>;

  private resizeSub!: Subscription;

  result = signal<ConnectQuestionRequest>([]);
  resultLeft = computed(() => this.result().map(r => r.leftId));
  resultRight = computed(() => this.result().map(r => r.rightId));
  selectedLeftId = signal<number | null>(null);

  description!: any;
  sanitizer = inject(DomSanitizer);

  get isImageGrid() {
    return this.data.connectRight.every(itm => !!itm.file);
  }

  ngOnInit() {
    this.description = this.sanitizer.bypassSecurityTrustHtml(this.data.description);
  }

  ngAfterViewInit() {
    this.resizeSub = fromEvent(window, "resize")
      .pipe(debounceTime(100))
      .subscribe(() => this.drawLines());
    setTimeout(() => this.drawLines());
  }

  ngOnDestroy() {
    this.resizeSub.unsubscribe();
  }

  onSelectLeft(id: number) {
    const current = this.selectedLeftId();

    if (current === id) {
      this.selectedLeftId.set(null);
      return;
    }

    const existingIndex = this.result().findIndex(r => r.leftId === id);
    if (existingIndex !== -1) {
      this.result.update(r => r.filter((_, i) => i !== existingIndex));
      this.drawLines();
      this.update.emit(this.result());
    }

    this.selectedLeftId.set(id);
  }

  onSelectRight(id: number) {
    const leftId = this.selectedLeftId();
    if (leftId === null) return;

    let newResult = this.result().filter(r => r.leftId !== leftId && r.rightId !== id);

    newResult = [...newResult, { leftId, rightId: id }];

    this.result.set(newResult);
    this.selectedLeftId.set(null);

    this.drawLines();
    this.update.emit(this.result());
  }

  removeLines() {
    const svgEl = this.svgOverlay.nativeElement;
    while (svgEl.firstChild) {
      svgEl.removeChild(svgEl.firstChild);
    }
  }

  private drawLines() {
    this.removeLines();

    const svgEl = this.svgOverlay.nativeElement;
    const svgRect = svgEl.getBoundingClientRect();

    const leftPositions = new Map<number, DOMRect>();
    this.leftItems.forEach(el => {
      const id = Number(el.nativeElement.dataset["id"]);
      leftPositions.set(id, el.nativeElement.getBoundingClientRect());
    });

    const rightPositions = new Map<number, DOMRect>();
    this.rightItems.forEach(el => {
      const id = Number(el.nativeElement.dataset["id"]);
      rightPositions.set(id, el.nativeElement.getBoundingClientRect());
    });

    this.result().forEach(pair => {
      const leftRect = leftPositions.get(pair.leftId);
      const rightRect = rightPositions.get(pair.rightId);

      if (!leftRect || !rightRect) return;

      const x1 = leftRect.right - svgRect.left;
      const y1 = leftRect.top + leftRect.height / 2 - svgRect.top;
      const x2 = rightRect.left - svgRect.left;
      const y2 = rightRect.top + rightRect.height / 2 - svgRect.top;

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x1.toString());
      line.setAttribute("y1", y1.toString());
      line.setAttribute("x2", x2.toString());
      line.setAttribute("y2", y2.toString());
      line.setAttribute("stroke", "#6B46C1");
      line.setAttribute("stroke-width", "4");
      line.setAttribute("stroke-linecap", "round");
      line.setAttribute("stroke-linejoin", "round");
      line.setAttribute("class", "connection-line");

      svgEl.appendChild(line);
    });
  }
}
