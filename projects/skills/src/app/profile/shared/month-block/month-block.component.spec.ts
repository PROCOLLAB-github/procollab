import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthBlockComponent } from './month-block.component';

describe('MonthBlockComponent', () => {
  let component: MonthBlockComponent;
  let fixture: ComponentFixture<MonthBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthBlockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MonthBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
