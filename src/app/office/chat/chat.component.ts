/** @format */

import { Component, OnInit } from "@angular/core";
import { NavService } from "../services/nav.service";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"]
})
export class ChatComponent implements OnInit {
  constructor(private navService: NavService) {
  }

  ngOnInit(): void {
    this.navService.setNavTitle("Чат");
  }
}
