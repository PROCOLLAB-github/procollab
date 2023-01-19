/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavService } from "../../services/nav.service";
import { NavigationStart, Router } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
  selector: "app-nav",
  templateUrl: "./nav.component.html",
  styleUrls: ["./nav.component.scss"],
})
export class NavComponent implements OnInit, OnDestroy {
  constructor(public readonly navService: NavService, private readonly router: Router) {}

  ngOnInit(): void {
    this.routerEvents$ = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.mobileMenuOpen = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.routerEvents$?.unsubscribe();
  }

  routerEvents$?: Subscription;

  mobileMenuOpen = false;
}
