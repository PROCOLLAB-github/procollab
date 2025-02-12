/** @format */

import { AsyncPipe, CommonModule } from "@angular/common";
import { AfterViewInit, Component, ElementRef, inject, ViewChild } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, RouterModule, RouterOutlet } from "@angular/router";
import { ButtonComponent, CheckboxComponent } from "@ui/components";
import { AvatarComponent } from "@uilib";
import { map } from "rxjs";

@Component({
  selector: "app-students",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AsyncPipe,
    AvatarComponent,
    ButtonComponent,
    CheckboxComponent,
  ],
  templateUrl: "./students.component.html",
  styleUrl: "./students.component.scss",
})
export class ProfileStudentsComponent {
  route = inject(ActivatedRoute);

  placeholderUrl =
    "https://uch-ibadan.org.ng/wp-content/uploads/2021/10/Profile_avatar_placeholder_large.png";

  expanded = false;
}
