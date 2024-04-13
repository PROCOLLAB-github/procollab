import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoTaskComponent } from './video-task.component';

describe('VideoTaskComponent', () => {
  let component: VideoTaskComponent;
  let fixture: ComponentFixture<VideoTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoTaskComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VideoTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
