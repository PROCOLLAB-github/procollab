/** @format */

import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { ReactiveFormsModule, FormControl } from "@angular/forms";
import { InputComponent } from "./input.component";

const meta: Meta<InputComponent> = {
  title: "UI/PRIMITIVES/Input",
  component: InputComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule],
    }),
  ],
  argTypes: {
    placeholder: { control: "text" },
    type: { control: "select", options: ["text", "password", "email", "tel", "date", "radio"] },
    size: { control: "inline-radio", options: ["small", "big"] },
    hasBorder: { control: "boolean" },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
    maxLength: { control: "number" },
    mask: { control: "text" },
  },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl(""),
    },
    template: `<app-input
      [formControl]="control"
      [placeholder]="placeholder"
      [type]="type"
      [size]="size"
      [hasBorder]="hasBorder"
      [error]="error"
      [maxLength]="maxLength"
      [mask]="mask"
    ></app-input>`,
  }),
};
export default meta;

type Story = StoryObj<InputComponent>;

export const Default: Story = {
  args: { placeholder: "Введите текст", type: "text", size: "small" },
};

export const Big: Story = {
  args: { placeholder: "Большое поле", type: "text", size: "big" },
};

export const Password: Story = {
  args: { placeholder: "Пароль", type: "password", size: "small" },
};

export const Email: Story = {
  args: { placeholder: "email@example.com", type: "email", size: "small" },
};

export const WithError: Story = {
  args: { placeholder: "Ошибка", type: "text", size: "small", error: true },
};

export const WithMaxLength: Story = {
  args: { placeholder: "Макс. 20 символов", type: "text", size: "small", maxLength: 20 },
};

export const WithMask: Story = {
  args: { placeholder: "+7 (000) 000-00-00", type: "tel", size: "small", mask: "+7 (000) 000-00-00" },
};

export const Disabled: Story = {
  args: { placeholder: "Заблокировано", type: "text", size: "small" },
  decorators: [
    moduleMetadata({ imports: [ReactiveFormsModule] }),
  ],
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl({ value: "", disabled: true }),
    },
    template: `<app-input
      [formControl]="control"
      [placeholder]="placeholder"
      [type]="type"
      [size]="size"
    ></app-input>`,
  }),
};
