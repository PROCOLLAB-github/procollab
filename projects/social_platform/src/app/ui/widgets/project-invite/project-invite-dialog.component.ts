/** @format */

import { inject as injectReleaseLayout } from "@angular/core";
import { DesktopLayoutService as ReleaseDesktopLayoutService } from "../../../../../../ui/src/lib/services/desktop-layout.service";

import { ButtonDirective, DialogBodyDirective, DialogFooterDirective } from "@uilib";

import { A11yModule, CdkTrapFocus } from "@angular/cdk/a11y";
import { Overlay } from "@angular/cdk/overlay";
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { IconComponent } from "@ui/primitives/icon/icon.component";

@Component({
  selector: "app-project-invite-dialog",
  imports: [
    DialogBodyDirective,
    DialogFooterDirective,
    ButtonDirective,
    ModalComponent,
    IconComponent,
    A11yModule,
  ],
  templateUrl: "./project-invite-dialog.component.html",
  styleUrl: "./project-invite-dialog.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectInviteDialogComponent implements AfterViewInit {
  protected readonly releaseDesktop = injectReleaseLayout(ReleaseDesktopLayoutService).desktop;

  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly trigger = input<HTMLElement | null>(null);
  readonly compact = input(false);
  readonly closed = output<void>();
  protected readonly open = signal(true);
  protected readonly attached = signal(false);
  private readonly destroyRef = inject(DestroyRef);
  private readonly overlays = inject(Overlay);
  @ViewChild(ModalComponent) private modal!: ModalComponent;
  @ViewChild(ModalComponent, { read: ViewContainerRef }) private modalContainer!: ViewContainerRef;
  @ViewChild(CdkTrapFocus) private trap!: CdkTrapFocus;
  @ViewChild("dialog") private dialog!: ElementRef<HTMLElement>;

  constructor() {
    this.destroyRef.onDestroy(() => {
      const overlay = this.modal?.overlayRef;
      // app-modal прикрепляет portal отложенно; не даём уничтоженному окну открыться снова.
      if (this.modal) this.modal.overlayRef = undefined;
      overlay?.dispose();
      this.restoreFocus();
    });
  }

  ngAfterViewInit(): void {
    const overlay = this.modal.overlayRef!;
    const owner = this.modalContainer.injector.get(DestroyRef);
    overlay.updateScrollStrategy(this.overlays.scrollStrategies.block());
    overlay
      .attachments()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.open()) {
          overlay.detach();
          return;
        }
        this.attached.set(true);
        this.trap.focusTrap.attachAnchors();
        this.trap.enabled = true;
        const node = this.dialog.nativeElement;
        (
          node.querySelector<HTMLElement>("[data-invite-autofocus]") ?? node.querySelector("button")
        )?.focus();
      });
    overlay
      .detachments()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.attached.set(false);
        this.trap.enabled = false;
        if (this.destroyRef.destroyed || owner.destroyed) return;
        this.restoreFocus();
        this.closed.emit();
      });
    overlay
      .keydownEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        this.close();
      });
  }

  close(): void {
    this.open.set(false);
  }

  private restoreFocus(): void {
    const trigger = this.trigger();
    const restore = () => {
      if (trigger?.isConnected) trigger.focus();
    };
    // Button снимает disabled после обновления родителя; ждём завершения текущей отрисовки.
    if (this.compact()) queueMicrotask(restore);
    else restore();
  }
}
