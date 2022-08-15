/** @format */

import { Component, OnInit } from "@angular/core";
import { NotificationService } from "../../services/notification.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  constructor(private notificationService: NotificationService) {}

  hasNotifications = this.notificationService.hasNotifications;

  ngOnInit(): void {}
}
