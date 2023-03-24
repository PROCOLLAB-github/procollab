/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { SearchComponent } from "./search.component";

describe("SearchComponent", () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let onSwitchSearchSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchComponent],
      imports: [FormsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    onSwitchSearchSpy = spyOn(component, "onSwitchSearch").and.callThrough();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should not call onSwitchSearch when clicked and openable is false", () => {
    component.openable = false;
    const searchDiv = fixture.nativeElement.querySelector(".search__other");
    searchDiv.dispatchEvent(new Event("click"));
    fixture.detectChanges();
    expect(onSwitchSearchSpy).not.toHaveBeenCalled();
  });
});
