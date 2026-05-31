/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { WriteTaskComponent } from "./write-task.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { API_URL, PRODUCTION } from "@corelib";

describe("WriteTaskComponent", () => {
  let component: WriteTaskComponent;
  let fixture: ComponentFixture<WriteTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WriteTaskComponent, HttpClientTestingModule],
      providers: [{ provide: API_URL, useValue: "" }, { provide: PRODUCTION, useValue: false }],
    }).compileComponents();

    fixture = TestBed.createComponent(WriteTaskComponent);
    component = fixture.componentInstance;
    component.data = { order: 1, bodyText: "test", videoUrl: "" } as any;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
