import { Meta, StoryObj } from "@storybook/react";
import { PHDialog } from "./phDialog";

const meta = {
  title: 'Layout/phDialog',
  component: PHDialog,
  parameters: { layout: 'centered' },
  args: {
    header: <h1>Header</h1>,
    children: <p>Children</p>,
    actions: [{ children: 'Action', onClick: () => { } }],
    isOpen: true,
    isCancelable: true,
    isNotModal: false,
  },
} satisfies Meta<typeof PHDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Component: Story = {  };
