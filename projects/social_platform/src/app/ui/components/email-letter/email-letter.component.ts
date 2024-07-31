/** @format */

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonComponent } from "../button/button.component";

@Component({
  selector: "app-email-letter",
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: "./email-letter.component.html",
  styleUrl: "./email-letter.component.scss",
})
export class EmailLetterComponent {
  navigateFromEmailLetter() {}
}
