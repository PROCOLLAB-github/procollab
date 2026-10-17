/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { SearchComponent } from "./search.component";

describe("SearchComponent", () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let onSwitchSearchSpy: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, SearchComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    onSwitchSearchSpy = vi.spyOn(component, "onSwitchSearch");
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("closes search without cancelling native controls elsewhere on the page", async () => {
    await fixture.whenStable();
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    document.body.append(checkbox);
    try {
      checkbox.click();
      expect(onSwitchSearchSpy).toHaveBeenCalledWith(false);
      expect(checkbox.checked).toBe(true);
    } finally {
      checkbox.remove();
    }
  });

  it("should not call onSwitchSearch when clicked and openable is false", () => {
    fixture.componentRef.setInput("openable", false);
    const searchDiv = fixture.nativeElement.querySelector(".search__other");
    searchDiv.dispatchEvent(new Event("click"));
    fixture.detectChanges();
    expect(onSwitchSearchSpy).not.toHaveBeenCalled();
  });
});
