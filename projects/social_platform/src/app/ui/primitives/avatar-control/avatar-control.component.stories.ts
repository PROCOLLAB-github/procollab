/** @format */

import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { ReactiveFormsModule, FormControl } from "@angular/forms";
import { AvatarControlComponent } from "./avatar-control.component";

const meta: Meta<AvatarControlComponent> = {
  title: "UI/PRIMITIVES/AvatarControl",
  component: AvatarControlComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule],
    }),
  ],
  argTypes: {
    size: { control: "number" },
    error: { control: "boolean" },
    type: { control: "select", options: ["avatar", "project", "profile"] },
  },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl(""),
    },
    template: `<app-avatar-control
      [formControl]="control"
      [size]="size"
      [error]="error"
      [type]="type"
    ></app-avatar-control>`,
  }),
};
export default meta;

type Story = StoryObj<AvatarControlComponent>;

export const Default: Story = {
  args: { size: 140, type: "avatar" },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl("https://i.pravatar.cc/300?img=12"),
    },
    template: `<app-avatar-control
      [formControl]="control"
      [size]="size"
      [error]="error"
      [type]="type"
    ></app-avatar-control>`,
  }),
};

export const Project: Story = {
  args: { size: 100, type: "project" },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl("https://picsum.photos/seed/project/200/200"),
    },
    template: `<app-avatar-control
      [formControl]="control"
      [size]="size"
      [error]="error"
      [type]="type"
    ></app-avatar-control>`,
  }),
};

export const Profile: Story = {
  args: { size: 160, type: "profile" },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl("https://i.pravatar.cc/300?img=32"),
    },
    template: `<app-avatar-control
      [formControl]="control"
      [size]="size"
      [error]="error"
      [type]="type"
    ></app-avatar-control>`,
  }),
};

export const Empty: Story = {
  args: { size: 140, type: "avatar" },
};

export const WithError: Story = {
  args: { size: 140, type: "avatar", error: true },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl(""),
    },
    template: `<app-avatar-control
      [formControl]="control"
      [size]="size"
      [error]="error"
      [type]="type"
    ></app-avatar-control>`,
  }),
};

export const Small: Story = {
  args: { size: 80, type: "avatar" },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl("https://i.pravatar.cc/300?img=47"),
    },
    template: `<app-avatar-control
      [formControl]="control"
      [size]="size"
      [error]="error"
      [type]="type"
    ></app-avatar-control>`,
  }),
};
