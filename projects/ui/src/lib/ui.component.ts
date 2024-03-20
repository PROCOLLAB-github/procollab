import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-ui',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p>
      ui works!
    </p>
  `,
  styles: ``
})
export class UiComponent {

}
