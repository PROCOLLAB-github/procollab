/** @format */

import { Meta, StoryObj } from "@storybook/angular";
import { SwitchComponent } from "./switch.component";

const meta: Meta<SwitchComponent> = {
  title: "UI/PRIMITIVES/Switch",
  component: SwitchComponent,
  tags: ["autodocs"],
  argTypes: {
    checked: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<SwitchComponent>;

export const Off: Story = { args: { checked: false } };
export const On: Story = { args: { checked: true } };
