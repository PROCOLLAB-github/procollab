/** @format */
import { A11yModule, CdkTrapFocus } from "@angular/cdk/a11y";
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
import { Overlay } from "@angular/cdk/overlay";
import { MembersUIInfoService } from "@api/member/facades/ui/members-ui-info.service";
import { ModalComponent } from "@ui/primitives/modal/modal.component";
import { MembersFiltersComponent } from "../members-filters/members-filters.component";

/** Мобильная оболочка существующей формы фильтров; значения принадлежат странице, а не окну. */
@Component({
  selector: "app-member-filters-dialog",
  imports: [ModalComponent, A11yModule, MembersFiltersComponent],
  templateUrl: "./member-filters-dialog.component.html",
  styleUrl: "./member-filters-dialog.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberFiltersDialogComponent implements AfterViewInit {
  readonly filterForm = input.required<MembersUIInfoService["filterForm"]>();
  readonly trigger = input<HTMLElement | null>(null);
  readonly closed = output<void>();
  protected readonly open = signal(true);
  protected readonly attached = signal(false);
  private readonly destroyRef = inject(DestroyRef);
  private readonly overlayService = inject(Overlay);

  @ViewChild(ModalComponent) private modal!: ModalComponent;
  @ViewChild(ModalComponent, { read: ViewContainerRef }) private modalContainer!: ViewContainerRef;
  @ViewChild(CdkTrapFocus) private trap!: CdkTrapFocus;
  @ViewChild("closeButton") private closeButton!: ElementRef<HTMLButtonElement>;

  constructor() {
    this.destroyRef.onDestroy(() => {
      const overlay = this.modal?.overlayRef;
      // Shared modal прикрепляет portal отложенно: уничтоженное окно не должно открыться повторно.
      if (this.modal) this.modal.overlayRef = undefined;
      overlay?.dispose();
    });
  }

  /** Фокус захватывается после attachment portal, как в существующих модальных окнах ленты. */
  ngAfterViewInit(): void {
    const overlay = this.modal.overlayRef!;
    const owner = this.modalContainer.injector.get(DestroyRef);
    overlay.updateScrollStrategy(this.overlayService.scrollStrategies.block());
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
        this.closeButton.nativeElement.focus();
      });
    overlay
      .detachments()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.attached.set(false);
        this.trap.enabled = false;
        // Modal уничтожается раньше оболочки: демонтаж страницы не должен отправлять closed.
        if (this.destroyRef.destroyed || owner.destroyed) return;
        const trigger = this.trigger();
        if (trigger?.isConnected) trigger.focus();
        this.closed.emit();
      });
    overlay
      .keydownEvents()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          this.close();
        }
      });
  }

  /** Закрывает только представление; выбранные фильтры сохраняются и применяются прежним фасадом. */
  close(): void {
    this.open.set(false);
  }
}
