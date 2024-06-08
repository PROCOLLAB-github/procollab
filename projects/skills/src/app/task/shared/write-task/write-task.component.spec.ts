import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WriteTaskComponent } from './write-task.component';

describe('WriteTaskComponent', () => {
  let component: WriteTaskComponent;
  let fixture: ComponentFixture<WriteTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WriteTaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WriteTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
