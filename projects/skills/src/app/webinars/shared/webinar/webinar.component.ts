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
import { ProfileService } from "../../../profile/services/profile.service";

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
    ParseBreaksPipe,
    ParseLinksPipe,
  ],
  templateUrl: "./webinar.component.html",
  styleUrl: "./webinar.component.scss",
})
export class WebinarComponent implements OnInit {
  @Input() webinar!: Webinar;

  router = inject(Router);
  private readonly profileService = inject(ProfileService);
  cdRef = inject(ChangeDetectorRef);

  @ViewChild("descEl") descEl?: ElementRef;

  descriptionExpandable!: boolean;
  readFullDescription = false;
  description =
    "В современном мире финансовая независимость и стабильный доход стали важными целями для многих людей. Этот вебинар предназначен для тех, кто хочет узнать о проверенных стратегиях и методах, которые помогут увеличить доход и добиться финансового успеха. Мы рассмотрим не только традиционные способы заработка, но и современные подходы, которые позволяют зарабатывать больше";

  type = signal<"webinars" | "records">("webinars");
  isAvailable = signal(true); // TODO дата после которой становиться недоступен вебинар в будущем сделать
  isRegistrated = signal(false); // TODO сделать на бэк post запрос с регистрацией
  isSubscribed = signal(false);

  registrationModalOpen = signal(false);
  unAvailableModalOpen = signal(false);
  isSubscribedModalOpen = signal(false);

  ngOnInit() {
    this.type.set(this.router.url.split("/").slice(-1)[0] as "webinars" | "records");
    this.profileService.getSubscriptionData().subscribe(r => {
      this.isSubscribed.set(r.isSubscribed);
    });
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

  onWatchRecord(recordLink?: string) {
    // Убрать ? знак когда логика с ссылкой на запись появиться
    if (!this.isSubscribed()) {
      this.isSubscribedModalOpen.set(true);
    } else window.open("https://eyecannndy.com/", "_blank"); // TODO заменить на ссылку приходящую с бэка у каждой записи
  }
}
