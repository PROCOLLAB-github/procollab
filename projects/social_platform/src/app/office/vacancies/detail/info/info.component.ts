/** @format */

import {
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
import { IconComponent, SubscriptionPlansComponent } from "@uilib";
import { expandElement } from "@utils/expand-element";
import { SalaryTransformPipe } from "projects/core/src/lib/pipes/salary-transform.pipe";
import { map, Subscription } from "rxjs";

@Component({
  selector: "app-detail",
  standalone: true,
  imports: [
    IconComponent,
    TagComponent,
    ButtonComponent,
    ModalComponent,
    SubscriptionPlansComponent,
    RouterModule,
    ParseBreaksPipe,
    ParseLinksPipe,
    SalaryTransformPipe,
  ],
  templateUrl: "./info.component.html",
  styleUrl: "./info.component.scss",
})
export class VacancyInfoComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  projectService = inject(ProjectService);
  authService = inject(AuthService);
  subscriptionPlansService = inject(SubscriptionPlansService);
  cdRef = inject(ChangeDetectorRef);

  vacancy!: Vacancy;
  project!: Project;

  ngOnInit(): void {
    this.route.data.pipe(map(r => r["data"])).subscribe((vacancy: Vacancy) => {
      this.vacancy = vacancy;

      this.projectService.getOne(vacancy.project.id).subscribe((project: Project) => {
        this.project = project;
      });
    });

    const subscriptionsSub$ = this.subscriptionPlansService
      .getSubscriptions()
      .pipe(
        map(subscription => {
          if (Array.isArray(subscription)) {
            return subscription;
          } else return [subscription];
        })
      )
      .subscribe(subscriptions => {
        this.subscriptions.set(subscriptions);
      });
    this.subscriptions$.push(subscriptionsSub$);
  }

  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    const skillsElement = this.skillsEl?.nativeElement;
    this.skillsExpandable = skillsElement?.clientHeight < skillsElement?.scrollHeight;

    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  @ViewChild("skillsEl") skillsEl?: ElementRef;
  @ViewChild("descEl") descEl?: ElementRef;

  subscriptions$: Subscription[] = [];

  openModal = signal<boolean>(false);

  descriptionExpandable!: boolean;
  skillsExpandable!: boolean;

  readFullDescription = false;
  readFullSkills = false;

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }

  onExpandSkills(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullSkills = !isExpanded;
  }

  openSubscription = signal(false);
  subscriptions = signal<SubscriptionPlan[]>([]);

  openSkills() {
    location.href = "https://skills.procollab.ru";
  }
}
