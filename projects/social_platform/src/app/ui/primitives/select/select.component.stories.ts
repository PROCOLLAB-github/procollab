/** @format */

import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { ReactiveFormsModule, FormControl } from "@angular/forms";
import { SelectComponent } from "./select.component";

const sampleOptions = [
  { id: 1, value: "apple", label: "Яблоко" },
  { id: 2, value: "banana", label: "Банан" },
  { id: 3, value: "cherry", label: "Вишня" },
  { id: 4, value: "grape", label: "Виноград" },
  { id: 5, value: "kiwi", label: "Киви" },
];

const meta: Meta<SelectComponent> = {
  title: "UI/PRIMITIVES/Select",
  component: SelectComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule],
    }),
  ],
  argTypes: {
    placeholder: { control: "text" },
    size: { control: "inline-radio", options: ["small", "big"] },
    error: { control: "boolean" },
  },
  render: (args) => ({
    props: {
      ...args,
      options: sampleOptions,
      control: new FormControl(""),
    },
    template: `<app-select
      [formControl]="control"
      [options]="options"
      [placeholder]="placeholder"
      [size]="size"
      [error]="error"
    ></app-select>`,
  }),
};
export default meta;

type Story = StoryObj<SelectComponent>;

export const Default: Story = {
  args: { placeholder: "Выберите fruit", size: "small" },
};

export const Big: Story = {
  args: { placeholder: "Большой селект", size: "big" },
};

export const WithError: Story = {
  args: { placeholder: "Ошибка", size: "small", error: true },
};

export const WithValue: Story = {
  args: { placeholder: "Выбрано", size: "small" },
  render: (args) => ({
    props: {
      ...args,
      options: sampleOptions,
      control: new FormControl("banana"),
    },
    template: `<app-select
      [formControl]="control"
      [options]="options"
      [placeholder]="placeholder"
      [size]="size"
    ></app-select>`,
  }),
};
