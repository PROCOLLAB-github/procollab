/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SwitchComponent } from "./switch.component";

describe("SwitchComponent", () => {
  let component: SwitchComponent;
  let fixture: ComponentFixture<SwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SwitchComponent],
}).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should emit checkedChange when clicked", async () => {
    spyOn(component.checkedChange, "emit");
    const switchElement = fixture.nativeElement.querySelector(".switch");
    switchElement.click();
    expect(component.checkedChange.emit).toHaveBeenCalledWith(true);
  });

  it('should apply the "switch--active" class when checked is true', () => {
    component.checked = true;
    fixture.detectChanges();
    const switchElement = fixture.nativeElement.querySelector(".switch");
    expect(switchElement.classList.contains("switch--active")).toBe(true);
  });

  it('should not apply the "switch--active" class when checked is false', () => {
    component.checked = false;
    fixture.detectChanges();
    const switchElement = fixture.nativeElement.querySelector(".switch");
    expect(switchElement.classList.contains("switch--active")).toBe(false);
  });
});
