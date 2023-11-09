/** @format */

import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { User } from "@auth/models/user.model";
import { AuthService } from "@auth/services";
import { ChatService } from "@office/services/chat.service";
import { expandElement } from "@utils/expand-element";
import { Observable, map } from "rxjs";

@Component({
  selector: "app-profile-main",
  templateUrl: "./main.component.html",
  styleUrls: ["./main.component.scss"],
})
export class ProfileMainComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    public readonly authService: AuthService,
    public readonly chatService: ChatService,
    private readonly cdRef: ChangeDetectorRef
  ) {}

  user: Observable<User> = this.route.data.pipe(map(r => r["data"]));
  loggedUserId: Observable<number> = this.authService.profile.pipe(map(user => user.id));

  ngOnInit(): void {}

  @ViewChild("descEl") descEl?: ElementRef;
  ngAfterViewInit(): void {
    const descElement = this.descEl?.nativeElement;
    this.descriptionExpandable = descElement?.clientHeight < descElement?.scrollHeight;

    this.cdRef.detectChanges();
  }

  descriptionExpandable = false;
  readFullDescription = false;

  readAllProjects = false;
  readAllAchievements = false;
  readAllLinks = false;

  onExpandDescription(elem: HTMLElement, expandedClass: string, isExpanded: boolean): void {
    expandElement(elem, expandedClass, isExpanded);
    this.readFullDescription = !isExpanded;
  }
}
