/** @format */

import { Meta, StoryObj } from "@storybook/angular";
import { TooltipComponent } from "./tooltip.component";

const meta: Meta<TooltipComponent> = {
  title: "UI/PRIMITIVES/Tooltip",
  component: TooltipComponent,
  tags: ["autodocs"],
  argTypes: {
    text: { control: "text" },
    isVisible: { control: "boolean" },
    position: { control: "inline-radio", options: ["left", "right"] },
    iconSize: { control: "text" },
    tooltipWidth: { control: "number" },
    color: { control: "inline-radio", options: ["accent", "grey"] },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 60px 120px; position: relative;">
        <app-tooltip
          [text]="text"
          [isVisible]="isVisible"
          [position]="position"
          [iconSize]="iconSize"
          [tooltipWidth]="tooltipWidth"
          [color]="color"
        ></app-tooltip>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<TooltipComponent>;

export const Default: Story = {
  args: {
    text: "Это подсказка с текстом",
    isVisible: true,
    position: "right",
    iconSize: "16",
    tooltipWidth: 250,
    color: "accent",
  },
};

export const Left: Story = {
  args: {
    text: "Подсказка слева",
    isVisible: true,
    position: "left",
    iconSize: "16",
    tooltipWidth: 200,
    color: "accent",
  },
};

export const Grey: Story = {
  args: {
    text: "Серая подсказка",
    isVisible: true,
    position: "right",
    iconSize: "16",
    tooltipWidth: 250,
    color: "grey",
  },
};

export const Hidden: Story = {
  args: {
    text: "Скрыта",
    isVisible: false,
    position: "right",
    iconSize: "16",
    tooltipWidth: 250,
    color: "accent",
  },
};

export const SmallIcon: Story = {
  args: {
    text: "Маленькая иконка",
    isVisible: true,
    position: "right",
    iconSize: "12",
    tooltipWidth: 200,
    color: "accent",
  },
};
