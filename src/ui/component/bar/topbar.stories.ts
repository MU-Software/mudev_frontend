import { Meta, StoryObj } from "@storybook/react";
import { Topbar } from "@ui/component/bar/topbar";

const meta = {
  title: 'Bar/Topbar',
  component: Topbar,
  parameters: { layout: 'centered' },
  args: {routeData: []},
} satisfies Meta<typeof Topbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Component: Story = {};

