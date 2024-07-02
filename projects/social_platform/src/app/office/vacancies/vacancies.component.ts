import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpenVacancyComponent } from '@office/feed/shared/open-vacancy/open-vacancy.component';
import { FeedItem, FeedItemType } from '@office/feed/models/feed-item.model';
import { ApiPagination } from '@office/models/api-pagination.model';
import { ActivatedRoute } from '@angular/router';

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
    this.route.data.subscribe(r => {
      this.feedItems.set(r['data'].results)
    });
  }

  feedItems = signal<FeedItem[]>([]);
}
