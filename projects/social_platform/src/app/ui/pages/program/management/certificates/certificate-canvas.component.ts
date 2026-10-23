/** @format */
import { ChangeDetectionStrategy, Component, input, output, signal } from "@angular/core";
import {
  CertificateBox,
  CertificateDraft,
  CertificateElement,
} from "@domain/program/program-certificates.model";
import { moveCertificateBox, resizeCertificateBox } from "@utils/certificate-layout";

@Component({
  selector: "app-certificate-canvas",
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
  readonly longName = input(false);
  readonly layoutChange = output<CertificateDraft["layout"]>();
  readonly selected = signal<CertificateElement>("name");
  readonly keys: CertificateElement[] = [
    "title",
    "subtitle",
    "name",
    "program",
    "date",
    "number",
    "director",
    "position",
    "signature",
  ];
  readonly labels: Record<CertificateElement, string> = {
    title: "Заголовок",
    subtitle: "Подзаголовок",
    name: "Имя участника",
    program: "Название программы",
    date: "Дата выдачи",
    number: "Номер",
    director: "Имя директора",
    position: "Должность",
    signature: "Подпись",
  };
  private drag: {
    key: CertificateElement;
    box: CertificateBox;
    x: number;
    y: number;
    rect: DOMRect;
    resize: boolean;
    pointer: number;
  } | null = null;
  visible(key: CertificateElement): boolean {
    return (
      !((key === "title" || key === "subtitle") && !this.draft().showText) &&
      (key !== "signature" || !!this.signature())
    );
  }
  text(key: CertificateElement): string {
    const draft = this.draft();
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
        return draft.director || "Имя директора";
      case "position":
        return draft.position || "Должность";
      default:
        return "";
    }
  }
  font(key: CertificateElement): string {
    const box = this.draft().layout[key];
    const size = Math.max(
      8,
      Math.min(
        box.fontSize,
        (box.height * 7.937) / 1.35,
        (box.width * 11.22 * 2.5) / Math.max(this.text(key).length, 1),
      ),
    );
    return `${size / 11.22}cqw`;
  }
  start(event: PointerEvent, key: CertificateElement, resize = false): void {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    this.selected.set(key);
    const target = event.currentTarget as HTMLElement;
    const canvas = target.closest(".canvas");
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
  }
  move(event: PointerEvent): void {
    const drag = this.drag;
    if (!drag || drag.pointer !== event.pointerId) return;
    const dx = ((event.clientX - drag.x) / drag.rect.width) * 100;
    const dy = ((event.clientY - drag.y) / drag.rect.height) * 100;
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
  }
  keydown(event: KeyboardEvent, key: CertificateElement): void {
    const directions: Record<string, number[]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const vector = directions[event.key];
    if (!vector) return;
    event.preventDefault();
    this.selected.set(key);
    const step = event.shiftKey ? 2 : 0.25;
    this.update(
      key,
      moveCertificateBox(this.draft().layout[key], vector[0] * step, vector[1] * step),
    );
  }
  center(): void {
    const key = this.selected(),
      box = this.draft().layout[key];
    this.update(key, { ...box, x: (100 - box.width) / 2 });
  }
  resizeSelected(scale: number): void {
    const key = this.selected(),
      box = this.draft().layout[key];
    this.update(
      key,
      resizeCertificateBox(
        box,
        box.width * scale,
        box.height * scale,
        key === "signature" ? this.signatureRatio() : undefined,
      ),
    );
  }
  private update(key: CertificateElement, box: CertificateBox): void {
    this.layoutChange.emit({ ...this.draft().layout, [key]: box });
  }
}
