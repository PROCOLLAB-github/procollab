import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatDirectComponent } from './chat-direct.component';

describe('ChatDirectComponent', () => {
  let component: ChatDirectComponent;
  let fixture: ComponentFixture<ChatDirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatDirectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatDirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
