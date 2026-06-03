/** @format */

import { Meta, StoryObj } from "@storybook/angular";
import { TagComponent } from "./tag.component";

const meta: Meta<TagComponent> = {
  title: "UI/PRIMITIVES/Tag",
  component: TagComponent,
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "accent",
        "accent-medium",
        "blue-dark",
        "cyan",
        "red",
        "complete",
        "complete-dark",
        "soft",
      ],
    },
    appearance: { control: "inline-radio", options: ["inline", "outline"] },
  },
  render: args => ({
    props: args,
    template: `<app-tag [color]="color" [appearance]="appearance">Метка</app-tag>`,
  }),
};
export default meta;

type Story = StoryObj<TagComponent>;

export const Primary: Story = { args: { color: "primary", appearance: "inline" } };
export const Outline: Story = { args: { color: "complete", appearance: "outline" } };
export const Red: Story = { args: { color: "red", appearance: "inline" } };
