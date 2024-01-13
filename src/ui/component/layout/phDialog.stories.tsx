import { Meta, StoryObj } from '@storybook/react'
import { Form } from 'react-bootstrap'

import { PHDialog } from './phDialog'

const meta = {
  title: 'Layout/phDialog',
  component: PHDialog,
  parameters: { layout: 'centered' },
  args: {
    header: <h1>Header</h1>,
    children: <p>Children</p>,
    actions: [{ children: 'Action', onClick: () => {} }],
    isOpen: true,
    isCancelable: false,
    isNotModal: false,
  },
} satisfies Meta<typeof PHDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Component: Story = {}

export const WithForm: Story = {
  args: {
    isCancelable: true,
    children: (
      <Form>
        <Form.Group>
          <Form.Label>Label</Form.Label>
          <Form.Control type="text" placeholder="Placeholder" />
        </Form.Group>
      </Form>
    ),
  },
}
