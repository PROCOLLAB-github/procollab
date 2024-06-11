import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@uilib';
import { ButtonComponent } from '@ui/components';
import { SwitchComponent } from '@ui/components/switch/switch.component';
import { ModalComponent } from '@ui/components/modal/modal.component';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent, SwitchComponent, ModalComponent],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss'
})
export class SubscriptionComponent {
  open = signal(false);
  checked = signal(false);

  // subscriptions = signal<SubscriptionPlan[]>([]);
  subscriptions = Array(3)

  features = Array(5);

  onOpenChange(event: boolean) {
    this.open.set(event);
    this.checked.set(this.checked())
  }

  onCheckedChange(event: boolean) {
    this.checked.set(event);
    this.open.set(this.open());
  }

  onCloseModal() {
    this.open.set(false);
    this.checked.set(false);
  }
}
