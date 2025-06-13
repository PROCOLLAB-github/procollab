/** @format */

import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "@ui/components";
import { IconComponent } from "@uilib";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { ModalComponent } from "@ui/components/modal/modal.component";

@Component({
  selector: "app-trajectory-block",
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent, ModalComponent],
  templateUrl: "./trajectory-block.component.html",
  styleUrl: "./trajectory-block.component.scss",
})
export class TrajectoryBlockComponent {
  private readonly router = inject(Router);

  isErrorTrajectoryModalOpen = false;

  onOpenErorTrajectoryModalChange = (): void => {
    this.isErrorTrajectoryModalOpen = !this.isErrorTrajectoryModalOpen;
  };

  navigateToTrajectory = (): void => {
    this.router.navigateByUrl("/trackCar/1").catch(err => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 404) {
          this.isErrorTrajectoryModalOpen = true;
        }
      }
    });
  };
}
