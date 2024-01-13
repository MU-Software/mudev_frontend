import { Meta, StoryObj } from '@storybook/react'
import { PHFoldableComponent } from './phFold'

const meta = {
  title: 'Layout/phFold',
  component: PHFoldableComponent,
  parameters: { layout: 'centered' },
  args: {
    open: false,
    title: 'Title',
    description: 'Content',
    children: 'Content',
  },
} satisfies Meta<typeof PHFoldableComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Component: Story = {}
