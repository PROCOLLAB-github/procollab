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

@Component({
  selector: "app-trajectory",
  standalone: true,
  imports: [CommonModule, ButtonComponent, ModalComponent, IconComponent, RouterModule],
  templateUrl: "./trajectory.component.html",
  styleUrl: "./trajectory.component.scss",
})
export class TrajectoryComponent implements OnInit, AfterViewInit {
  @Input() trajectory!: any;
  protected readonly dotsArray = Array;

  router = inject(Router);
  trajectoryService = inject(TrajectoriesService);

  cdRef = inject(ChangeDetectorRef);
  sanitizer = inject(DomSanitizer);

  @ViewChild("descEl") descEl?: ElementRef;

  placeholderUrl =
    "https://uch-ibadan.org.ng/wp-content/uploads/2021/10/Profile_avatar_placeholder_large.png";

  descriptionExpandable!: boolean;
  readFullDescription = false;

  currentPage = 1;

  moreModalOpen = signal(false);
  isSubscribedConfirmModalOpen = signal(false);

  confirmModalOpen = signal(false);
  nonConfirmerModalOpen = signal(false);
  instructionModalOpen = signal(false);

  type = signal<"all" | "my" | null>(null);

  trajectoryMore = [
    {
      label: "Работа с наставником",
    },
    {
      label: "Индивидуальный набор навыков",
    },
    {
      label: "Трекинг прогресса",
    },
    {
      label: "Действия > Обучение",
    },
  ];

  instructions = [{}];

  ngOnInit(): void {
    this.type.set(this.router.url.split("/").slice(-1)[0] as "all" | "my");
  }

  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    this.cdRef.detectChanges();
  }

  onOpenConfirmClick() {
    this.isSubscribedConfirmModalOpen.set(!this.isSubscribedConfirmModalOpen());
    if (this.isSubscribedConfirmModalOpen()) {
      this.confirmModalOpen.set(true);
    } else {
      this.nonConfirmerModalOpen.set(true);
    }
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
    if (this.currentPage < 4) {
      this.currentPage += 1;
    } else if (this.currentPage === 4) {
      this.router.navigate(["/trackCar/1"]);
    }
  }

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }
}
