/** @format */

import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-modal",
  templateUrl: "./modal.component.html",
  styleUrl: "./modal.component.scss",
  standalone: true,
  imports: [CommonModule],
})
export class ModalComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private readonly overlay: Overlay,
    private readonly viewContainerRef: ViewContainerRef
  ) {}

  @Input() color?: "primary" | "gradient" = "primary";

  @Input({ required: true }) set open(value: boolean) {
    setTimeout(() => {
      if (value) this.overlayRef?.attach(this.portal);
      else this.overlayRef?.detach();
    });
  }

  get open(): boolean {
    return !!this.overlayRef?.hasAttached();
  }

  @Output() openChange = new EventEmitter<boolean>();

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.modalTemplate) {
      this.overlayRef = this.overlay.create({});
      this.portal = new TemplatePortal(this.modalTemplate, this.viewContainerRef);
    }
  }

  ngOnDestroy(): void {
    this.overlayRef?.detach();
  }

  @ViewChild("modalTemplate") modalTemplate?: TemplateRef<HTMLElement>;

  portal?: TemplatePortal;
  overlayRef?: OverlayRef;
}
