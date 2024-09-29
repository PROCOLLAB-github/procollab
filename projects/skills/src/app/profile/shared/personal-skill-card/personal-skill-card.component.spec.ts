import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalSkillCardComponent } from './personal-skill-card.component';

describe('PersonalSkillCardComponent', () => {
  let component: PersonalSkillCardComponent;
  let fixture: ComponentFixture<PersonalSkillCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalSkillCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonalSkillCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
