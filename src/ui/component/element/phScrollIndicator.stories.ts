import { Meta, StoryObj } from '@storybook/react'
import { PHScrollIndicator } from './phScrollIndicator'

const meta = {
  title: 'Component/phScrollIndicator',
  component: PHScrollIndicator,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof PHScrollIndicator>

export default meta
type Story = StoryObj<typeof meta>

export const Component: Story = {}
