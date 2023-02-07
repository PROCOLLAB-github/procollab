import { Component, Input, OnInit } from "@angular/core";
import { User } from "@auth/models/user.model";

@Component({
  selector: "app-profile-info",
  templateUrl: "./profile-info.component.html",
  styleUrls: ["./profile-info.component.scss"],
})
export class ProfileInfoComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  @Input() user?: User;
}
