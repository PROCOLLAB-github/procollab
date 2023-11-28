/** @format */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { SnackbarService } from "@ui/services/snackbar.service";
import { Snack } from "@ui/models/snack.model";
import { Subscription } from "rxjs";
import { AnimationService } from "@ui/services/animation.service";
import { NgFor, NgClass } from "@angular/common";

@Component({
    selector: "app-snackbar",
    templateUrl: "./snackbar.component.html",
    styleUrl: "./snackbar.component.scss",
    animations: [AnimationService.slideInOut],
    standalone: true,
    imports: [NgFor, NgClass],
})
export class SnackbarComponent implements OnInit, OnDestroy {
  constructor(private readonly snackbarService: SnackbarService) {}

  snacks: Snack[] = [];
  snackbar$?: Subscription;

  private addNotification(snack: Snack): void {
    this.snacks.push(snack);

    if (snack.timeout !== 0) {
      setTimeout(() => this.onClose(snack), snack.timeout);
    }
  }

  ngOnInit(): void {
    this.snackbar$ = this.snackbarService.snacks.subscribe(snack => this.addNotification(snack));
  }

  ngOnDestroy(): void {
    this.snackbar$?.unsubscribe();
  }

  onClose(snack: Snack): void {
    this.snacks = this.snacks.filter(({ id }) => id !== snack.id);
  }
}
