import { Meta, StoryObj } from "@storybook/react";
import { PHFormFoldableComponent } from "./phFormFold";

const meta = {
  title: 'Layout/phFormFold',
  component: PHFormFoldableComponent,
  parameters: { layout: 'centered' },
  args: {
    open: false,
    title: 'Title',
    description: 'Content',
    apiRoute: '/api',
    apiMethod: 'POST',
    children: 'Content',
    submitBtnChildren: '제출',
  },
  argTypes: {
    submitBtnChildren: {control: 'text'},
  },
} satisfies Meta<typeof PHFormFoldableComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Component: Story = {  };
