/** @format */

import { Meta, StoryObj } from "@storybook/angular";
import { ImgCardComponent } from "./img-card.component";

const meta: Meta<ImgCardComponent> = {
  title: "UI/PRIMITIVES/ImgCard",
  component: ImgCardComponent,
  tags: ["autodocs"],
  argTypes: {
    src: { control: "text" },
    loading: { control: "boolean" },
    error: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<ImgCardComponent>;

export const Default: Story = {
  args: { src: "https://picsum.photos/seed/procollab/240/160", loading: false, error: false },
};

export const Loading: Story = { args: { src: "", loading: true, error: false } };

export const ErrorState: Story = { args: { src: "", loading: false, error: true } };
