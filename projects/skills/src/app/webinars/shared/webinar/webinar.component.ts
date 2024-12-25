/** @format */

import { CommonModule, DatePipe } from "@angular/common";
import {
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
import { ParseBreaksPipe, ParseLinksPipe, YtExtractService } from "@corelib";
import { ButtonComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { AvatarComponent, IconComponent } from "@uilib";
import { expandElement } from "@utils/expand-element";
import { Webinar } from "projects/skills/src/models/webinars.model";
import { ProfileService } from "../../../profile/services/profile.service";
import { DomSanitizer } from "@angular/platform-browser";
import { WebinarService } from "../../services/webinar.service";
import { tap, throwError } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-webinar",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AvatarComponent,
    ButtonComponent,
    ModalComponent,
    IconComponent,
  ],
  templateUrl: "./webinar.component.html",
  styleUrl: "./webinar.component.scss",
})
export class WebinarComponent implements OnInit {
  @Input() webinar!: Webinar;

  router = inject(Router);
  webinarService = inject(WebinarService);

  cdRef = inject(ChangeDetectorRef);
  sanitizer = inject(DomSanitizer);

  @ViewChild("descEl") descEl?: ElementRef;

  descriptionExpandable!: boolean;
  readFullDescription = false;

  type = signal<"actual" | "records" | null>(null);
  isRegistrated = signal(false);

  registrationModalOpen = signal(false);
  isSubscribedModalOpen = signal(false);
  isSubscribedModalText = signal("");

  formattedDate = signal("");

  ngOnInit() {
    this.type.set(this.router.url.split("/").slice(-1)[0] as "actual" | "records");

    this.formattedDate.set(
      new Date(this.webinar.datetimeStart).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
      })
    );
  }

  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    this.cdRef.detectChanges();
  }

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }

  onRegistration(webinarId: number) {
    if (!this.webinar.isRegistrated) {
      this.webinarService.registrationOnWebinar(webinarId).subscribe();
      this.registrationModalOpen.set(true);
      this.isRegistrated.set(true);
    }
  }

  onWatchRecord(webinarId: number) {
    this.webinarService.getWebinarLink(webinarId).subscribe({
      next: ({ recordingLink }) => {
        window.open(recordingLink, "_blank");
      },
      error: error => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 403) {
            this.isSubscribedModalText.set(error.error.detail);
            this.isSubscribedModalOpen.set(true);
            console.log(error.error.detail);
          }
        }
      },
    });
  }
}
