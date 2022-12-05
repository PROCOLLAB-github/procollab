import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumSliderComponent } from './num-slider.component';

describe('NumSliderComponent', () => {
  let component: NumSliderComponent;
  let fixture: ComponentFixture<NumSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NumSliderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NumSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
