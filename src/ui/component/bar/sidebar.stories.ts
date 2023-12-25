import { Meta, StoryObj } from "@storybook/react";
import { DummySidebar, Sidebar } from "@local/ui/component/bar/sidebar";

const sidebarMeta = {
  title: 'Bar/Sidebar',
  component: Sidebar,
  parameters: { layout: 'centered' },
  args: {sidebarItems: []},
} satisfies Meta<typeof Sidebar>;

const dummySidebarMeta = {
  title: 'Bar/DummySidebar',
  component: DummySidebar,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DummySidebar>;

export default sidebarMeta;

type SidebarStory = StoryObj<typeof sidebarMeta>;
type DummySidebarStory = StoryObj<typeof dummySidebarMeta>;

export const SidebarComponent: SidebarStory = {};
export const DummySidebarComponent: DummySidebarStory = {};

