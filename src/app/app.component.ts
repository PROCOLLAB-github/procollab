/** @format */

import { Component } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  form: FormGroup;
  options = [
    { id: 1, label: "343", value: "343" },
    { id: 2, label: "4", value: "34" },
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      type: [""],
    });
  }

  onSubmit() {
    console.log(this.form.value);
  }
}
