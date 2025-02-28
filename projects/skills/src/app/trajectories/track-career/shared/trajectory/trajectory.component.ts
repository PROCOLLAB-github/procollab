/** @format */

import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { ButtonComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { TrajectoriesService } from "../../../trajectories.service";
import { DomSanitizer } from "@angular/platform-browser";
import { expandElement } from "@utils/expand-element";
import { IconComponent } from "@uilib";
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { Trajectory } from "projects/skills/src/models/trajectory.model";
import { trajectoryMore } from "projects/core/src/consts/trajectoryMore";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-trajectory",
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    ModalComponent,
    IconComponent,
    RouterModule,
    ParseLinksPipe,
    ParseBreaksPipe,
  ],
  templateUrl: "./trajectory.component.html",
  styleUrl: "./trajectory.component.scss",
})
export class TrajectoryComponent implements AfterViewInit {
  @Input() trajectory!: Trajectory;
  protected readonly dotsArray = Array;
  protected readonly trajectoryMore = trajectoryMore;

  router = inject(Router);
  trajectoryService = inject(TrajectoriesService);

  cdRef = inject(ChangeDetectorRef);
  sanitizer = inject(DomSanitizer);

  @ViewChild("descEl") descEl?: ElementRef;

  descriptionExpandable!: boolean;
  readFullDescription = false;

  currentPage = 1;

  moreModalOpen = signal(false);

  confirmModalOpen = signal(false);
  nonConfirmerModalOpen = signal(false);
  instructionModalOpen = signal(false);

  placeholderUrl =
    "https://uch-ibadan.org.ng/wp-content/uploads/2021/10/Profile_avatar_placeholder_large.png";

  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    this.cdRef.detectChanges();
  }

  onOpenConfirmClick() {
    if (!this.trajectory.isActiveForUser) {
      this.confirmModalOpen.set(true);
    } else {
      this.router.navigate(["/trackCar/" + this.trajectory.id]);
    }

    this.trajectoryService.activateTrajectory(this.trajectory.id).subscribe({
      next: () => {},
      error: err => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 403) {
            this.nonConfirmerModalOpen.set(true);
          }
        }
      },
    });
  }

  onConfirmClick() {
    this.confirmModalOpen.set(false);
    this.instructionModalOpen.set(true);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }

  nextPage(): void {
    if (this.currentPage === 4) {
      this.router.navigate(["/trackCar/" + this.trajectory.id]);
    } else if (this.currentPage < 4) {
      this.currentPage += 1;
    }
  }

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }
}
