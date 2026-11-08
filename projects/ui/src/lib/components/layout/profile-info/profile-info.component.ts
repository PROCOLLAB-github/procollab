/** @format */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { CdkMenu, CdkMenuModule } from "@angular/cdk/menu";
import { ClickOutsideModule } from "ng-click-outside";
import { User } from "@domain/auth/user.model";
import { ThemeService, type ThemePreference } from "../../../services/theme.service";
import { AvatarComponent } from "../../primitives/avatar/avatar.component";
import { IconComponent } from "../../primitives/icon/icon.component";

/** Аватар и меню профиля с настройкой оформления. */
@Component({
  selector: "app-profile-info",
  templateUrl: "./profile-info.component.html",
  styleUrl: "./profile-info.component.scss",
  imports: [RouterLink, CdkMenuModule, ClickOutsideModule, AvatarComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileInfoComponent {
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>("trigger");
  private readonly menu = viewChild(CdkMenu);
  protected readonly menuOpen = signal(false);
  protected readonly theme = inject(ThemeService);
  protected readonly themeOptions: ReadonlyArray<{ value: ThemePreference; label: string }> = [
    { value: "system", label: "Системная" },
    { value: "light", label: "Светлая" },
    { value: "dark", label: "Темная" },
    { value: "dark-special", label: "Темная специальная" },
  ];

  readonly avatarSize = window.innerWidth < 920 ? 42 : 33;
  readonly user = input.required<User>();
  readonly logout = output<void>();

  protected toggleMenu(): void {
    if (this.menuOpen()) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  protected openMenu(event?: Event): void {
    event?.preventDefault();
    this.menuOpen.set(true);
    // Render before handing focus to the menu in the zoneless app.
    this.changeDetector.detectChanges();
    this.menu()?.focusFirstItem(event ? "keyboard" : "mouse");
  }

  protected closeMenu(restoreFocus = false): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (restoreFocus) this.trigger()?.nativeElement.focus();
    this.changeDetector.detectChanges();
  }

  protected onFocusOut(event: FocusEvent): void {
    if (!this.host.nativeElement.contains(event.relatedTarget as Node | null)) this.closeMenu();
  }

  protected onEscape(event: Event): void {
    if (!this.menuOpen()) return;
    event.stopPropagation();
    event.preventDefault();
    this.closeMenu(true);
  }

  protected selectTheme(preference: ThemePreference): void {
    this.theme.setPreference(preference);
    this.closeMenu(true);
  }
}
