/** @format */

import { CommonModule } from "@angular/common";
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
import { ParseBreaksPipe, ParseLinksPipe } from "@corelib";
import { ButtonComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { AvatarComponent, IconComponent } from "@uilib";
import { expandElement } from "@utils/expand-element";
import { Webinar } from "projects/skills/src/models/webinars.model";

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
    WebinarComponent,
    ParseBreaksPipe,
    ParseLinksPipe,
  ],
  templateUrl: "./webinar.component.html",
  styleUrl: "./webinar.component.scss",
})
export class WebinarComponent implements OnInit {
  @Input() webinar!: Webinar;

  router = inject(Router);
  cdRef = inject(ChangeDetectorRef);

  @ViewChild("descEl") descEl?: ElementRef;

  descriptionExpandable!: boolean;
  readFullDescription = false;
  description =
    "В современном мире финансовая независимость и стабильный доход стали важными целями для многих людей. Этот вебинар предназначен для тех, кто хочет узнать о проверенных стратегиях и методах, которые помогут увеличить доход и добиться финансового успеха. Мы рассмотрим не только традиционные способы заработка, но и современные подходы, которые позволяют зарабатывать больше";

  type = signal<"webinars" | "records">("webinars");
  isAvailable = signal(true);
  isRegistrated = signal(false);
  isSubscribed = signal(false); // заменить на логику на бэке

  registrationModalOpen = signal(false);
  unAvailableModalOpen = signal(false);
  isSubscribedModalOpen = signal(false);

  ngOnInit() {
    this.type.set(this.router.url.split("/").slice(-1)[0] as "webinars" | "records");
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

  onRegistration() {
    if (this.isAvailable()) {
      this.registrationModalOpen.set(true);
      this.isRegistrated.set(true);
    } else {
      this.unAvailableModalOpen.set(true);
    }
  }

  onWatchRecord() {
    this.isSubscribedModalOpen.set(true);
  }
}
