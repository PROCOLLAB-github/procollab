/** @format */

import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../../auth/services";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ErrorMessage } from "../../../error/models/error-message";
import { SelectComponent } from "../../../ui/components";

@Component({
  selector: "app-profile-edit",
  templateUrl: "./profile-edit.component.html",
  styleUrls: ["./profile-edit.component.scss"],
})
export class ProfileEditComponent implements OnInit {
  constructor(public authService: AuthService, private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      name: ["", [Validators.required]],
      surname: ["", [Validators.required]],
      status: ["", [Validators.required]],
      birthday: ["", [Validators.required]],
      city: ["", [Validators.required]],
      organisation: ["", [Validators.required]],
      achievments: this.fb.array([]),
    });
  }

  errorMessage = ErrorMessage;

  statusOptions: SelectComponent["options"] = [
    { id: 1, value: "Ученик", label: "Ученик" },
    { id: 2, value: "Ментор", label: "Ментор" },
  ];

  profileForm: FormGroup;

  ngOnInit(): void {}
}
