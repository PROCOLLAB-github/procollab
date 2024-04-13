import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioSelectTaskComponent } from './radio-select-task.component';

describe('RadioSelectTaskComponent', () => {
  let component: RadioSelectTaskComponent;
  let fixture: ComponentFixture<RadioSelectTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioSelectTaskComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RadioSelectTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
