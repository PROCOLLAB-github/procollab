import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramHeadComponent } from './program-head.component';

describe('ProgramHeadComponent', () => {
  let component: ProgramHeadComponent;
  let fixture: ComponentFixture<ProgramHeadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgramHeadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramHeadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
