import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressBlockComponent } from './progress-block.component';

describe('ProgressBlockComponent', () => {
  let component: ProgressBlockComponent;
  let fixture: ComponentFixture<ProgressBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBlockComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProgressBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
