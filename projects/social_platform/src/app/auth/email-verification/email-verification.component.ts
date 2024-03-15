/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { filter, interval, map, noop, Observable, Subscription } from "rxjs";
import { AuthService } from "@auth/services";
import { IconComponent } from "@ui/components";

@Component({
  selector: "app-email-verification",
  templateUrl: "./email-verification.component.html",
  styleUrl: "./email-verification.component.scss",
  standalone: true,
  imports: [IconComponent],
})
export class EmailVerificationComponent implements OnInit, OnDestroy {
  constructor(private route: ActivatedRoute, private readonly authService: AuthService) {}

  ngOnInit(): void {
    const emailSub$ = this.route.queryParams.pipe(map(r => r["adress"])).subscribe(r => {
      this.userEmail = r;
    });
    this.subscriptions$.push(emailSub$);

    const timerSub$ = this.timer$.subscribe(noop);
    this.subscriptions$.push(timerSub$);
  }

  ngOnDestroy(): void {
    this.subscriptions$.forEach($ => $.unsubscribe());
  }

  subscriptions$: Subscription[] = [];
  userEmail?: string;
  counter = 0;
  timer$: Observable<number> = interval(1000).pipe(
    filter(() => this.counter > 0),
    map(() => this.counter--)
  );

  onResend(): void {
    if (!this.userEmail) return;
    this.authService.resendEmail(this.userEmail).subscribe(() => {
      this.counter = 60;
    });
  }
}
