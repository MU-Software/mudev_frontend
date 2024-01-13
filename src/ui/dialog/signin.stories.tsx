import { Meta, StoryObj } from '@storybook/react'

import { PHSignInDialog } from '@local/ui/dialog/signin'

const meta = {
  title: 'Dialog/SignIn',
  component: PHSignInDialog,
  parameters: { layout: 'centered' },
  args: { isOpen: true },
} satisfies Meta<typeof PHSignInDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Component: Story = {}
