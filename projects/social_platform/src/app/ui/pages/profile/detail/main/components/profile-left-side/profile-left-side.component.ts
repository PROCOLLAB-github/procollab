/** @format */

import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject, Input, WritableSignal } from "@angular/core";
import { RouterModule } from "@angular/router";
import { YearsFromBirthdayPipe } from "@corelib";
import { IconComponent } from "@ui/primitives";
import { TruncatePipe } from "@core/lib/pipes/formatters/truncate.pipe";
import { ExpandService } from "@api/expand/expand.service";
import { User } from "@domain/auth/user.model";

@Component({
  selector: "app-profile-left-side",
  templateUrl: "./profile-left-side.component.html",
  styleUrl: "./profile-left-side.component.scss",
  imports: [CommonModule, RouterModule, IconComponent, YearsFromBirthdayPipe, TruncatePipe],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileLeftSideComponent {
  @Input() user!: WritableSignal<User | undefined>;

  private readonly expandService = inject(ExpandService);

  protected readonly readAllPrograms = this.expandService.readAllPrograms;
}
