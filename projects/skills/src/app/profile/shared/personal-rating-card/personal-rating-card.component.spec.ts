import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalRatingCardComponent } from './personal-rating-card.component';

describe('PersonalRatingCardComponent', () => {
  let component: PersonalRatingCardComponent;
  let fixture: ComponentFixture<PersonalRatingCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalRatingCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonalRatingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
