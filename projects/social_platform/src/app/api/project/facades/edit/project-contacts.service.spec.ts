/** @format */

import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormArray, FormBuilder } from "@angular/forms";
import { ProjectContactsService } from "./project-contacts.service";
import { ProjectFormService } from "./project-form.service";

describe("ProjectContactsService", () => {
  let service: ProjectContactsService;
  let links: FormArray;

  beforeEach(() => {
    const fb = new FormBuilder();
    const form = fb.group({ links: fb.array([]), link: [""] });
    links = form.get("links") as FormArray;

    TestBed.configureTestingModule({
      providers: [
        ProjectContactsService,
        {
          provide: ProjectFormService,
          useValue: { getForm: () => form, editIndex: signal<number | null>(null) },
        },
      ],
    });

    service = TestBed.inject(ProjectContactsService);
  });

  it("adds visible independent controls for multiple project contact links", () => {
    service.addLink(links);
    service.addLink(links);

    links.at(0).setValue("https://t.me/procollab");
    links.at(1).setValue("https://vk.com/procollab");

    expect(service.hasLinks()).toBe(true);
    expect(service.linkControls()).toEqual(links.controls);
    expect(links.getRawValue()).toEqual(["https://t.me/procollab", "https://vk.com/procollab"]);
  });

  it("keeps the reactive controls snapshot synchronized across remove and add", () => {
    service.addLink(links);
    service.addLink(links);

    service.removeLink(0, links);
    expect(service.linkControls()).toEqual([links.at(0)]);

    service.removeLink(0, links);
    expect(service.linkControls()).toEqual([]);
    expect(service.hasLinks()).toBe(false);

    service.addLink(links);
    expect(service.linkControls()).toEqual([links.at(0)]);
    expect(service.hasLinks()).toBe(true);
  });

  it("synchronizes existing links without changing their values", () => {
    links.push(new FormBuilder().control("https://example.com"));

    service.syncLinksItems(links);

    expect(service.linkControls()).toEqual([links.at(0)]);
    expect(links.getRawValue()).toEqual(["https://example.com"]);
  });
});
