/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { AuthService } from "@auth/services";
import {
  ParseBreaksPipe,
  ParseLinksPipe,
  SubscriptionPlan,
  SubscriptionPlansService,
} from "@corelib";
import { Project } from "@office/models/project.model";
import { Vacancy } from "@office/models/vacancy.model";
import { ProjectService } from "@office/services/project.service";
import { ButtonComponent } from "@ui/components";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { TagComponent } from "@ui/components/tag/tag.component";
import { AvatarComponent, IconComponent, SubscriptionPlansComponent } from "@uilib";
import { expandElement } from "@utils/expand-element";
import { SalaryTransformPipe } from "projects/core/src/lib/pipes/salary-transform.pipe";
import { map, Subscription } from "rxjs";
import { SkillCardComponent } from "../../../../skills/shared/skill-card/skill-card.component";
import { CommonModule } from "@angular/common";
import { MonthBlockComponent } from "projects/skills/src/app/profile/shared/month-block/month-block.component";

@Component({
  selector: "app-detail",
  standalone: true,
  imports: [
    IconComponent,
    ButtonComponent,
    RouterModule,
    ParseBreaksPipe,
    ParseLinksPipe,
    SkillCardComponent,
    AvatarComponent,
    CommonModule,
    MonthBlockComponent,
  ],
  templateUrl: "./info.component.html",
  styleUrl: "./info.component.scss",
})
export class TrajectoryInfoComponent implements OnInit, AfterViewInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  cdRef = inject(ChangeDetectorRef);
  subscriptions$: Subscription[] = [];

  @ViewChild("descEl") descEl?: ElementRef;

  ngOnInit(): void {}

  skill = {
    fileLink: "",
    id: 1,
    name: "Создание CV1",
    quantityOfLevels: 1,
    whoCreated: "Я",
    description: "Навык по созданию CV",
    isDone: false,
    freeAccess: true,
  };

  mockMonts = [
    {
      month: "1 месяц",
      successfullyDone: true,
      year: 2025,
    },
    {
      month: "2 месяц",
      successfullyDone: true,
      year: 2025,
    },
    {
      month: "3 месяц",
      successfullyDone: false,
      year: 2025,
    },
    {
      month: "4 месяц",
      successfullyDone: false,
      year: 2025,
    },
  ];

  readFullDescription = false;
  descriptionExpandable?: boolean;

  description =
    "Четырехмесячный интенсив, в котором ты поймешь азы карьерного планирования. С опытным наставником, ты разберешь свои сильные стороны, проработаешь барьеры на пути к успешной карьере. Четырехмесячный интенсив, в котором ты поймешь азы карьерного планирования. С опытным наставником, ты разберешь свои сильные стороны, проработаешь барьеры на пути к успешной карьере. ";

  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }

  placeholderUrl =
    "https://uch-ibadan.org.ng/wp-content/uploads/2021/10/Profile_avatar_placeholder_large.png";
}
