/** @format */

import { Component, OnInit } from "@angular/core";
import { NavService } from "../services/nav.service";

@Component({
  selector: "app-people",
  templateUrl: "./people.component.html",
  styleUrls: ["./people.component.scss"],
})
export class PeopleComponent implements OnInit {
  constructor(private navService: NavService) {}

  ngOnInit(): void {
    this.navService.setNavTitle("Участники");
  }
}
