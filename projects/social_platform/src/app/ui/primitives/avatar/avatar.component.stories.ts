/** @format */

import { Meta, StoryObj } from "@storybook/angular";
import { AvatarComponent } from "@uilib";

const meta: Meta<AvatarComponent> = {
  title: "UI/PRIMITIVES/Avatar",
  component: AvatarComponent,
  tags: ["autodocs"],
  argTypes: {
    url: { control: "text" },
    size: { control: "number" },
    hasBorder: { control: "boolean" },
    isOnline: { control: "boolean" },
    onlineBadgeSize: { control: "number" },
    onlineBadgeBorder: { control: "number" },
    onlineBadgeOffset: { control: "number" },
  },
  render: args => ({
    props: args,
    template: `
      <app-avatar
      [url]="url"
      [size]="size"
      [hasBorder]="hasBorder"
      [isOnline]="isOnline"
      [onlineBadgeSize]="onlineBadgeSize"
      [onlineBadgeBorder]="onlineBadgeBorder"
      [onlineBadgeOffset]="onlineBadgeOffset"
      >
      </app-avatar>
    `,
  }),
};

export default meta;

type Story = StoryObj<AvatarComponent>;

export const Primary: Story = {
  args: {
    url: "",
    size: 50,
    hasBorder: false,
    isOnline: false,
  },
};

export const Online: Story = {
  args: {
    url: "",
    size: 50,
    hasBorder: false,
    isOnline: true,
    onlineBadgeSize: 16,
    onlineBadgeBorder: 3,
    onlineBadgeOffset: 0,
  },
};

export const HasBorder: Story = {
  args: {
    url: "",
    size: 50,
    hasBorder: true,
  },
};
