import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalRatingCardComponent } from '../shared/personal-rating-card/personal-rating-card.component';
import { ButtonComponent } from '@ui/components';
import { RouterLink } from '@angular/router';
import { IconComponent } from '@uilib';

@Component({
  selector: 'app-skill-chooser',
  standalone: true,
  imports: [CommonModule, PersonalRatingCardComponent, ButtonComponent, RouterLink, IconComponent],
  templateUrl: './skill-chooser.component.html',
  styleUrl: './skill-chooser.component.scss'
})
export class SkillChooserComponent {
  skillsList = Array
}
