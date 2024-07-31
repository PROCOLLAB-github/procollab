import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailLetterComponent } from './email-letter.component';

describe('EmailLetterComponent', () => {
  let component: EmailLetterComponent;
  let fixture: ComponentFixture<EmailLetterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailLetterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmailLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
