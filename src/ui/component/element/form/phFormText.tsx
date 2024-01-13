import React from 'react'
import { Form } from 'react-bootstrap'

import './phFormText.css'

const newLineHandler = (obj?: React.ReactNode | string) => {
  if (obj && (typeof obj === 'string' || obj instanceof String) && obj.includes('\n'))
    return (
      <div>
        {obj.split('\n').map((value) => (
          <>
            {value}
            <br />
          </>
        ))}
      </div>
    )
  return obj
}

export const PHFormText: React.FC<{
  className?: string
  defaultChildren?: React.ReactNode | string
  children?: React.ReactNode | string
  showOnlyNeeded?: boolean
}> = ({ className, defaultChildren, children, showOnlyNeeded }) => {
  defaultChildren = newLineHandler(defaultChildren)
  children = newLineHandler(children)

  return (
    <Form.Text
      className={(children ? 'text-danger ' : 'text-muted ') + 'PHFormGroupText ' + (className ? className : '')}
    >
      {children || defaultChildren || (showOnlyNeeded ? '' : '\u00A0')}
    </Form.Text>
  )
}
