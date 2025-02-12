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
  imports: [IconComponent, ButtonComponent, RouterModule, ParseBreaksPipe, ParseLinksPipe],
  templateUrl: "./info.component.html",
  styleUrl: "./info.component.scss",
})
export class TrajectoryInfoComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  cdRef = inject(ChangeDetectorRef);
  subscriptions$: Subscription[] = [];

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }
}
