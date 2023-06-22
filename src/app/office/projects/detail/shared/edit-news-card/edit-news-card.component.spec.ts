import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNewsCardComponent } from './edit-news-card.component';

describe('EditNewsCardComponent', () => {
  let component: EditNewsCardComponent;
  let fixture: ComponentFixture<EditNewsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditNewsCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditNewsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
