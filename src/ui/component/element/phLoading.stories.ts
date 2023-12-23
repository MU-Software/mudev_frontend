import { Meta, StoryObj } from "@storybook/react";
import { PHLoading } from "./phLoading";

const meta = {
  title: 'Component/phLoading',
  component: PHLoading,
  parameters: { layout: 'centered' },
  args: {
    emSize: 3,
    primaryColor: 'var(--color)',
    secondaryColor: 'transparent',
  },
  argTypes: {
    primaryColor: {control: 'text'},
    secondaryColor: {control: 'text'},
  },
} satisfies Meta<typeof PHLoading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Component: Story = { };

