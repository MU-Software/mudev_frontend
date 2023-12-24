import { Meta, StoryObj } from "@storybook/react";
import { PhDialog } from "./phDialog";

const meta = {
  title: 'Layout/phDialog',
  component: PhDialog,
  parameters: { layout: 'centered' },
  args: {
    header: <h1>Header</h1>,
    children: <p>Children</p>,
    actions: [{ children: 'Action', onClick: () => { } }],
    isOpen: true,
    isCancelable: true,
    isNotModal: false,
  },
} satisfies Meta<typeof PhDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Component: Story = {  };
