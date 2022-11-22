/** @format */

import { Component, OnInit } from "@angular/core";
import { NavService } from "../../services/nav.service";

@Component({
  selector: "app-nav",
  templateUrl: "./nav.component.html",
  styleUrls: ["./nav.component.scss"]
})
export class NavComponent implements OnInit {
  constructor(public navService: NavService) {
  }

  ngOnInit(): void {
  }
}
