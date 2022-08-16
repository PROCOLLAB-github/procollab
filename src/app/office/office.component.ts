/** @format */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";

@Component({
  selector: "app-office",
  templateUrl: "./office.component.html",
  styleUrls: ["./office.component.scss"],
})
export class OfficeComponent implements OnInit, AfterViewInit {
  constructor(private cdref: ChangeDetectorRef) {}

  ngOnInit(): void {}

  bodyHeight = "0px";

  @ViewChild("general") general?: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    if (this.general) {
      this.bodyHeight = `${window.screen.availHeight - this.general.nativeElement.clientHeight}px`;
      this.cdref.detectChanges();
    }
  }
}
