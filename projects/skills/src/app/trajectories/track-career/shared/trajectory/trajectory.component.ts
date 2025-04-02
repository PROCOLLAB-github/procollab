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
import { ParseBreaksPipe, ParseLinksPipe, PluralizePipe } from "@corelib";
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
    PluralizePipe,
    ParseBreaksPipe,
  ],
  templateUrl: "./trajectory.component.html",
  styleUrl: "./trajectory.component.scss",
})
export class TrajectoryComponent implements AfterViewInit, OnInit {
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
  activatedModalOpen = signal(false);

  type = signal<"all" | "my" | null>(null);

  placeholderUrl =
    "https://uch-ibadan.org.ng/wp-content/uploads/2021/10/Profile_avatar_placeholder_large.png";

  ngOnInit() {
    this.type.set(this.router.url.split("/").slice(-1)[0] as "all" | "my");
  }

  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    this.cdRef.detectChanges();
  }

  onOpenConfirmClick() {
    this.trajectoryService.activateTrajectory(this.trajectory.id).subscribe({
      next: () => {
        if (!this.trajectory.isActiveForUser) {
          this.confirmModalOpen.set(true);
        }
      },
      error: err => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 403) {
            this.nonConfirmerModalOpen.set(true);
          } else if (err.status === 400) {
            this.activatedModalOpen.set(true);
            this.nonConfirmerModalOpen.set(false);
            this.instructionModalOpen.set(false);
            this.confirmModalOpen.set(false);
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
      this.navigateOnTrajectory();
    } else if (this.currentPage < 4) {
      this.currentPage += 1;
    }
  }

  navigateOnTrajectory() {
    this.router.navigate(["/trackCar/" + this.trajectory.id]).catch(err => {
      if (err.status === 403) {
        this.nonConfirmerModalOpen.set(true);
      }
    });
  }

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }
}
