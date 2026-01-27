/** @format */

import { SalaryTransformPipe } from "./salary-transform.pipe";

describe("SalaryTrasformPipe", () => {
  it("create an instance", () => {
    const pipe = new SalaryTransformPipe();
    expect(pipe).toBeTruthy();
  });
});
