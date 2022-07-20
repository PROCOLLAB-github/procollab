/** @format */

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../services";

@Component({
  selector: "app-login",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      name: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.authService.register(this.registerForm.value).subscribe(console.log);
  }
}
