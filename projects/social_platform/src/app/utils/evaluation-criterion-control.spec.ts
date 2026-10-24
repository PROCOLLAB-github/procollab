/** @format */
import { ProjectRatingCriterion } from "@domain/project/project-rating-criterion";
import { evaluationCriterionControl } from "./evaluation-criterion-control";

const definition: ProjectRatingCriterion = {
  id: 1,
  name: "Качество",
  description: "",
  type: "int",
  minValue: 0,
  maxValue: 10,
  value: "",
  expertId: 0,
};
describe("Shared expert / preview criterion validation", () => {
  it("distinguishes empty, zero, fraction, and out-of-range answers", () => {
    const control = evaluationCriterionControl(definition);
    expect(control.invalid).toBe(true);
    control.setValue(0);
    expect(control.valid).toBe(true);
    for (const value of [0.5, -1, 11, NaN, Infinity]) {
      control.setValue(value);
      expect(control.invalid).toBe(true);
    }
  });
  it("supports negative scales, legacy fractions, deliberate No, and optional 1000-character comments", () => {
    expect(evaluationCriterionControl({ ...definition, minValue: -5, value: -2 }).valid).toBe(true);
    expect(evaluationCriterionControl({ ...definition, type: "float", value: 0.5 }).valid).toBe(
      true,
    );
    const no = evaluationCriterionControl({ ...definition, type: "bool", value: "False" });
    expect(no.value).toBe(false);
    expect(no.valid).toBe(true);
    const unanswered = evaluationCriterionControl({ ...definition, type: "bool" });
    expect(unanswered.value).toBeNull();
    expect(unanswered.invalid).toBe(true);
    unanswered.setValue(false);
    expect(unanswered.valid).toBe(true);
    const comment = evaluationCriterionControl({ ...definition, type: "str" });
    expect(comment.valid).toBe(true);
    comment.setValue("я".repeat(1000));
    expect(comment.valid).toBe(true);
    comment.setValue("я".repeat(1001));
    expect(comment.invalid).toBe(true);
  });
});
