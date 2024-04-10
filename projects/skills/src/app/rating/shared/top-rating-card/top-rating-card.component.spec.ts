import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopRatingCardComponent } from './top-rating-card.component';

describe('TopRatingCardComponent', () => {
  let component: TopRatingCardComponent;
  let fixture: ComponentFixture<TopRatingCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopRatingCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TopRatingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
