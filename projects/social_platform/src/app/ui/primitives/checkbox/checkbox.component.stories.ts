/** @format */

import { Meta, StoryObj } from "@storybook/angular";
import { CheckboxComponent } from "./checkbox.component";

const meta: Meta<CheckboxComponent> = {
  title: "UI/PRIMITIVES/Checkbox",
  component: CheckboxComponent,
  tags: ["autodocs"],
  argTypes: {
    checked: { control: "boolean" },
    size: { control: "text" },
  },
};
export default meta;

type Story = StoryObj<CheckboxComponent>;

export const Unchecked: Story = { args: { checked: false } };
export const Checked: Story = { args: { checked: true } };
