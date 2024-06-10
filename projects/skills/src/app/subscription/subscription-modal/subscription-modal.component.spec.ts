import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionModalComponent } from './subscription-modal.component';

describe('SubscriptionModalComponent', () => {
  let component: SubscriptionModalComponent;
  let fixture: ComponentFixture<SubscriptionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubscriptionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
