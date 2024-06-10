import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@uilib';
import { ButtonComponent } from '@ui/components';

@Component({
  selector: 'app-subscription-modal',
  standalone: true,
  imports: [CommonModule, IconComponent, ButtonComponent],
  templateUrl: './subscription-modal.component.html',
  styleUrl: './subscription-modal.component.scss'
})
export class SubscriptionModalComponent {
  @Input() open!: boolean;
  @Input() checked!: boolean;
  
  @Output() openChange = new EventEmitter<boolean>();
  @Output() checkedChange = new EventEmitter<boolean>()

  onCloseModal(open: boolean) {
    if (open) {
      this.openChange.emit(false);
    } else this.checkedChange.emit(false);
  }
}
