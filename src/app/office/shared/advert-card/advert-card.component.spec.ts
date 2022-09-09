import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvertCardComponent } from './advert-card.component';

describe('AdvertCardComponent', () => {
  let component: AdvertCardComponent;
  let fixture: ComponentFixture<AdvertCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdvertCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvertCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
