import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarComponent } from '@ui/components';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-vacancies',
  standalone: true,
  imports: [CommonModule, BarComponent, RouterOutlet],
  templateUrl: './vacancies.component.html',
  styleUrl: './vacancies.component.scss'
})

export class VacanciesComponent { }
