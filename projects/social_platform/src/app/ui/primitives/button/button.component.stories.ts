/** @format */

import type { Meta, StoryObj } from "@storybook/angular";
import { ButtonComponent } from "./button.component";

const meta: Meta<ButtonComponent> = {
  title: "UI/PRIMITIVES/Button",
  component: ButtonComponent,
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "select",
      options: ["primary", "red", "grey", "green", "gold", "gradient", "white"],
    },
    size: { control: "select", options: ["extra-small", "small", "medium", "big"] },
    appearance: { control: "inline-radio", options: ["inline", "outline"] },
    type: { control: "select", options: ["submit", "reset", "button", "icon"] },
    loader: { control: "boolean" },
    hasBorder: { control: "boolean" },
    disabled: { control: "boolean" },
    backgroundColor: { control: "color" },
    customTypographyClass: { control: "text" },
  },
  render: args => ({
    props: args,
    template: `<app-button
      [color]="color"
      [size]="size"
      [appearance]="appearance"
      [type]="type"
      [loader]="loader"
      [hasBorder]="hasBorder"
      [disabled]="disabled"
      [backgroundColor]="backgroundColor"
      [customTypographyClass]="customTypographyClass"
    >Кнопка</app-button>`,
  }),
};
export default meta;

type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  args: { color: "primary", size: "medium", appearance: "inline" },
};

export const Outline: Story = {
  args: { color: "primary", size: "medium", appearance: "outline" },
};

export const Loading: Story = {
  args: { color: "primary", size: "medium", loader: true },
};

export const Disabled: Story = {
  args: { color: "primary", size: "medium", disabled: true },
};
