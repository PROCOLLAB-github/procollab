import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillChooserComponent } from './skill-chooser.component';

describe('SkillChooserComponent', () => {
  let component: SkillChooserComponent;
  let fixture: ComponentFixture<SkillChooserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillChooserComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SkillChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
