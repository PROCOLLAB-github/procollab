/** @format */

import { Directive, ElementRef, HostListener, inject, Renderer2 } from "@angular/core";

@Directive({
  selector: "img[appImagePreview]",
  standalone: true,
})
export class ImagePreviewDirective {
  private readonly el = inject(ElementRef<HTMLImageElement>);
  private readonly renderer = inject(Renderer2);

  constructor() {
    this.el.nativeElement.style.cursor = "pointer";
  }

  @HostListener("click")
  onClick(): void {
    const src = this.el.nativeElement.src;
    if (!src) return;

    const dialog = this.renderer.createElement("dialog") as HTMLDialogElement;
    dialog.classList.add("image-preview-dialog");

    const img = this.renderer.createElement("img") as HTMLImageElement;
    img.src = src;
    img.classList.add("image-preview-dialog__img");

    this.renderer.appendChild(dialog, img);
    this.renderer.appendChild(document.body, dialog);

    dialog.showModal();

    dialog.addEventListener("click", (e: MouseEvent) => {
      if (e.target === dialog) {
        dialog.close();
      }
    });

    dialog.addEventListener("close", () => {
      dialog.remove();
    });
  }
}
