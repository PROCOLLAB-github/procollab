import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpenVacancyComponent } from '@office/feed/shared/open-vacancy/open-vacancy.component';
import { ActivatedRoute } from '@angular/router';
import { Vacancy } from '@office/models/vacancy.model';

@Component({
  selector: 'app-vacancies',
  standalone: true,
  imports: [CommonModule, OpenVacancyComponent],
  templateUrl: './vacancies.component.html',
  styleUrl: './vacancies.component.scss'
})
export class VacanciesComponent implements OnInit {
  route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.data.subscribe(r => { this.vacanciesList.set(r['data'].results) })
  }

  vacanciesList = signal<Vacancy[]>([]);
}
