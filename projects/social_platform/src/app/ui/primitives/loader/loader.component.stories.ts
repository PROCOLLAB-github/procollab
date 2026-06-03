/** @format */

import { Meta, StoryObj } from "@storybook/angular";
import { LoaderComponent } from "./loader.component";

const meta: Meta<LoaderComponent> = {
  title: "UI/PRIMITIVES/Loader",
  component: LoaderComponent,
  tags: ["autodocs"],
  argTypes: {
    type: { control: "inline-radio", options: ["wave", "circle"] },
    color: { control: "color" },
    size: { control: "text" },
    speed: { control: "text" },
  },
};
export default meta;

type Story = StoryObj<LoaderComponent>;

// color по умолчанию white — на белом фоне не видно, задаём видимый.
export const Circle: Story = {
  args: { type: "circle", color: "#6c5ce7", size: "47px", speed: "1s" },
};

export const Wave: Story = {
  args: { type: "wave", color: "#6c5ce7", size: "47px", speed: "1s" },
};
