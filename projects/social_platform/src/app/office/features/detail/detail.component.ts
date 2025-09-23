/** @format */

import { CommonModule } from "@angular/common";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { ButtonComponent } from "@ui/components";
import { BackComponent, IconComponent } from "@uilib";
import { ModalComponent } from "@ui/components/modal/modal.component";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-detail",
  templateUrl: "./detail.component.html",
  styleUrl: "./detail.component.scss",
  imports: [
    CommonModule,
    RouterModule,
    IconComponent,
    ButtonComponent,
    BackComponent,
    ModalComponent,
  ],
  standalone: true,
})
export class DeatilComponent implements OnInit, OnDestroy {
  @Input({ required: true }) backPath!: string;

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
