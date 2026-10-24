/** @format */
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { ButtonDirective, ChoiceDirective, FieldDirective } from "@uilib";
import {
  CERTIFICATE_ELEMENTS,
  CERTIFICATE_LABELS,
  CertificateBox,
  CertificateDraft,
  CertificateElement,
} from "@domain/program/program-certificates.model";
import {
  fitCertificateText,
  hiddenCertificateElements,
  moveCertificateBox,
  resizeCertificateBox,
} from "@utils/certificate-layout";

@Component({
  selector: "app-certificate-canvas",
  imports: [ButtonDirective, ChoiceDirective, FieldDirective],
  templateUrl: "./certificate-canvas.component.html",
  styleUrl: "./certificate-canvas.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificateCanvasComponent {
  readonly draft = input.required<CertificateDraft>();
  readonly programName = input.required<string>();
  readonly background = input<string | null>(null);
  readonly signature = input<string | null>(null);
  readonly signatureRatio = input(2);
  readonly selected = input<CertificateElement>("name");
  readonly selectedChange = output<CertificateElement>();
  readonly longName = input(false);
  readonly longNameChange = output<boolean>();
  readonly preview = input(false);
  readonly disabled = input(false);
  readonly expanded = input(false);
  readonly layoutChange = output<CertificateDraft["layout"]>();
  readonly interactionStart = output<void>();
  readonly removeElement = output<CertificateElement>();
  readonly keys = CERTIFICATE_ELEMENTS;
  readonly labels = CERTIFICATE_LABELS;
  readonly zoom = signal(1);
  readonly dragging = signal(false);
  readonly viewport = viewChild<ElementRef<HTMLElement>>("viewport");
  private readonly availableWidth = signal(0);
  private readonly viewportHeight = signal(900);
  private readonly fontsReady = signal(false);
  private context: CanvasRenderingContext2D | null = null;
  private readonly destroy = inject(DestroyRef);
  readonly paperWidth = computed(() => {
    const width = this.availableWidth();
    const fit = this.expanded()
      ? Math.min(width, (Math.max(200, this.viewportHeight() - 400) * 297) / 210)
      : width;
    return fit * this.zoom();
  });
  readonly fits = computed(() => {
    this.fontsReady();
    const result = {} as Record<CertificateElement, { fontSize: number; text: string }>;
    const cache = new Map<string, number>();
    for (const key of this.keys) {
      const weight = key === "name" || key === "title" ? 600 : 400;
      const measure = (value: string) => {
        const id = `${weight}:${value}`;
        if (!cache.has(id)) {
          if (this.context) this.context.font = `${weight} 1000px Mont`;
          cache.set(id, this.context?.measureText(value).width ?? Array.from(value).length * 550);
        }
        return cache.get(id)!;
      };
      const fit = fitCertificateText(this.text(key), this.draft().layout[key], measure);
      result[key] = { fontSize: fit.fontSize, text: fit.lines.join("\n") };
    }
    return result;
  });
  readonly guideX = computed(
    () => this.dragging() && Math.abs(this.box().x + this.box().width / 2 - 50) < 0.05,
  );
  readonly guideY = computed(
    () => this.dragging() && Math.abs(this.box().y + this.box().height / 2 - 50) < 0.05,
  );
  private drag: {
    key: CertificateElement;
    box: CertificateBox;
    x: number;
    y: number;
    rect: DOMRect;
    resize: boolean;
    pointer: number;
  } | null = null;

  constructor() {
    afterNextRender(() => {
      if (typeof CanvasRenderingContext2D !== "undefined")
        this.context = document.createElement("canvas").getContext("2d");
      const measure = () => {
        const element = this.viewport()?.nativeElement;
        if (!element) return;
        const style = getComputedStyle(element);
        this.availableWidth.set(
          element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
        );
        this.viewportHeight.set(window.innerHeight);
      };
      const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
      if (this.viewport()) observer?.observe(this.viewport()!.nativeElement);
      window.addEventListener("resize", measure);
      measure();
      void document.fonts?.ready.then(() => {
        if (!this.destroy.destroyed) this.fontsReady.set(true);
      });
      this.destroy.onDestroy(() => {
        observer?.disconnect();
        window.removeEventListener("resize", measure);
      });
    });
  }
  box(): CertificateBox {
    return this.draft().layout[this.selected()];
  }
  visible(key: CertificateElement): boolean {
    return !hiddenCertificateElements(this.draft()).includes(
      key as Exclude<CertificateElement, "name">,
    );
  }
  text(key: CertificateElement): string {
    switch (key) {
      case "title":
        return "СЕРТИФИКАТ";
      case "subtitle":
        return "подтверждает участие";
      case "name":
        return this.longName() ? "Александра Константиновна Добровольская" : "Имя участника";
      case "program":
        return this.programName();
      case "date":
        return new Intl.DateTimeFormat("ru-RU", { timeZone: "Europe/Moscow" }).format(new Date());
      case "number":
        return "№ ПРОБНЫЙ";
      case "director":
        return this.draft().director;
      case "position":
        return this.draft().position;
      default:
        return "";
    }
  }
  select(key: CertificateElement): void {
    if (this.selected() !== key) this.selectedChange.emit(key);
  }
  start(event: PointerEvent, key: CertificateElement, resize = false): void {
    if (this.preview() || this.disabled() || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    this.select(key);
    this.interactionStart.emit();
    const target = event.currentTarget as HTMLElement,
      canvas = target.closest(".canvas");
    if (!canvas) return;
    target.setPointerCapture(event.pointerId);
    this.drag = {
      key,
      box: { ...this.draft().layout[key] },
      x: event.clientX,
      y: event.clientY,
      rect: canvas.getBoundingClientRect(),
      resize,
      pointer: event.pointerId,
    };
    this.dragging.set(true);
  }
  move(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.pointer !== event.pointerId) return;
    const dx = ((event.clientX - drag.x) / drag.rect.width) * 100,
      dy = ((event.clientY - drag.y) / drag.rect.height) * 100;
    this.update(
      drag.key,
      drag.resize
        ? resizeCertificateBox(
            drag.box,
            dx,
            dy,
            drag.key === "signature" ? this.signatureRatio() : undefined,
          )
        : moveCertificateBox(drag.box, dx, dy),
    );
  }
  end(): void {
    this.drag = null;
    this.dragging.set(false);
  }
  keydown(event: KeyboardEvent, key: CertificateElement, resize = false): void {
    if (this.preview() || this.disabled()) return;
    if ((event.key === "Delete" || event.key === "Backspace") && !resize) {
      event.preventDefault();
      event.stopPropagation();
      if (key !== "name") this.removeElement.emit(key);
      return;
    }
    const vector = (
      { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] } as Record<
        string,
        number[]
      >
    )[event.key];
    if (!vector) return;
    event.preventDefault();
    event.stopPropagation();
    this.select(key);
    this.interactionStart.emit();
    const amount = event.shiftKey ? 2 : 0.25,
      box = this.draft().layout[key];
    this.update(
      key,
      resize
        ? resizeCertificateBox(
            box,
            vector[0] * amount,
            vector[1] * amount,
            key === "signature" ? this.signatureRatio() : undefined,
          )
        : moveCertificateBox(box, vector[0] * amount, vector[1] * amount, false),
    );
  }
  center(vertical = false): void {
    if (this.disabled()) return;
    this.interactionStart.emit();
    const box = this.box();
    this.update(
      this.selected(),
      vertical ? { ...box, y: (100 - box.height) / 2 } : { ...box, x: (100 - box.width) / 2 },
    );
  }
  fontChanged(event: Event): void {
    if (this.disabled()) return;
    const target = event.target as HTMLInputElement,
      value = Number(target.value);
    if (!Number.isFinite(value) || value < 8 || value > 72) {
      target.value = String(this.box().fontSize);
      return;
    }
    this.interactionStart.emit();
    this.update(this.selected(), { ...this.box(), fontSize: value });
  }
  setZoom(value: number): void {
    this.zoom.set(Math.max(1, Math.min(2, value)));
  }
  private update(key: CertificateElement, box: CertificateBox): void {
    this.layoutChange.emit({ ...this.draft().layout, [key]: box });
  }
}
