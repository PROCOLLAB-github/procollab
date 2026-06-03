/** @format */

import { Meta, StoryObj } from "@storybook/angular";
import { SoonCardComponent } from "./soon-card.component";

const meta: Meta<SoonCardComponent> = {
  title: "UI/PRIMITIVES/SoonCard",
  component: SoonCardComponent,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
  },
};
export default meta;

type Story = StoryObj<SoonCardComponent>;

export const Default: Story = {
  args: { title: "Скоро", description: "Этот раздел ещё в разработке" },
};
