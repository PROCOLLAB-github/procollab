/** @format */

import {
  AfterViewInit,
  Component,
  ElementRef,
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

@Component({
  selector: "app-modal",
  templateUrl: "./modal.component.html",
  styleUrls: ["./modal.component.scss"],
})
export class ModalComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private readonly elRef: ElementRef,
    private readonly overlay: Overlay,
    private readonly viewContainerRef: ViewContainerRef
  ) {}

  @Input() set open(value: boolean) {
    if (value) this.overlayRef?.attach(this.portal);
    else this.overlayRef?.detach();
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
