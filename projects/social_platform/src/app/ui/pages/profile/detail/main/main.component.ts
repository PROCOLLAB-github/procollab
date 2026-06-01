/** @format */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ProfileDetailInfoService } from "@api/profile/facades/detail/profile-detail-info.service";
import { ProfileDetailUIInfoService } from "@api/profile/facades/detail/ui/profile-detail-ui-info.service";
import { ExpandService } from "@api/expand/expand.service";
import { ProfileLeftSideComponent } from "./components/profile-left-side/profile-left-side.component";
import { ProfileRightSideComponent } from "./components/profile-right-side/profile-right-side.component";
import { ProfileMidSideComponent } from "./components/profile-mid-side/profile-mid-side.component";

/** Главная страница профиля: информация, новости, навыки, проекты. */
@Component({
  selector: "app-profile-main",
  templateUrl: "./main.component.html",
  styleUrl: "./main.component.scss",
  imports: [
    CommonModule,
    ProfileLeftSideComponent,
    ProfileRightSideComponent,
    ProfileMidSideComponent,
  ],
  providers: [ProfileDetailInfoService, ProfileDetailUIInfoService, ExpandService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileMainComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("descEl") descEl?: ElementRef;

  private readonly profileDetailInfoService = inject(ProfileDetailInfoService);
  private readonly profileDetailUIInfoService = inject(ProfileDetailUIInfoService);

  protected readonly user = this.profileDetailUIInfoService.user;

  ngOnInit(): void {
    this.profileDetailInfoService.initializationProfile();
  }

  ngAfterViewInit(): void {
    this.profileDetailInfoService.initCheckDescription(this.descEl);
  }

  ngOnDestroy(): void {
    this.profileDetailInfoService.destroy();
  }
}
