import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicRatingCardComponent } from './basic-rating-card.component';

describe('BasicRatingCardComponent', () => {
  let component: BasicRatingCardComponent;
  let fixture: ComponentFixture<BasicRatingCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicRatingCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BasicRatingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
