/** @format */

import { Project } from "@domain/project/project.model";
import { ProjectsDetailUIInfoService } from "./projects-detail-ui.service";

describe("ProjectsDetailUIInfoService", () => {
  it("показывает полное название блока актуальности", () => {
    const service = new ProjectsDetailUIInfoService();
    service.applySetProject(Project.default());

    service.applyDirectionItems();

    expect(service.directions()[2].direction).toBe("актуальность");
  });
});
