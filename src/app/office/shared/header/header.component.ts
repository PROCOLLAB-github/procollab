/** @format */

import { Component, OnInit } from "@angular/core";
import { NotificationService } from "../../services/notification.service";
import { AuthService } from "../../../auth/services";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  constructor(private notificationService: NotificationService, public authService: AuthService) {}

  hasNotifications = this.notificationService.hasNotifications;

  ngOnInit(): void {}
}
