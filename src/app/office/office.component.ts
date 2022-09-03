/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { IndustryService } from "./services/industry.service";
import { noop, Subscription } from "rxjs";

@Component({
  selector: "app-office",
  templateUrl: "./office.component.html",
  styleUrls: ["./office.component.scss"],
})
export class OfficeComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(private cdref: ChangeDetectorRef, private industryService: IndustryService) {}

  bodyHeight = "0px";
  @ViewChild("general") general?: ElementRef<HTMLElement>;

  industrySub?: Subscription;

  ngOnInit(): void {
    this.industrySub = this.industryService.getAll().subscribe(noop);
  }

  ngAfterViewInit(): void {
    if (this.general) {
      this.bodyHeight = `${window.screen.availHeight - this.general.nativeElement.clientHeight}px`;
      this.cdref.detectChanges();
    }
  }

  ngOnDestroy(): void {
    this.industrySub?.unsubscribe();
  }
}
