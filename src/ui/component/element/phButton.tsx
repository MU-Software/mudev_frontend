import Icon from '@mdi/react'
import React from 'react'
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { OverlayChildren } from 'react-bootstrap/esm/Overlay'

import './phButton.css'

// From react-bootstrap
type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light'
export type ButtonVariant =
  | Variant
  | 'link'
  | 'outline-primary'
  | 'outline-secondary'
  | 'outline-success'
  | 'outline-danger'
  | 'outline-warning'
  | 'outline-info'
  | 'outline-dark'
  | 'outline-light'

interface PHButtonProps {
  variant?: ButtonVariant
  disabled?: boolean
  buttonType?: 'button' | 'submit' | 'reset'
  size?: 'extra-sm' | 'sm' | 'lg'
  style?: React.CSSProperties
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  width?: string
  height?: string
  smaller?: boolean
  children?: React.ReactNode
}

const PHButton: React.FC<PHButtonProps> = ({
  variant = 'outline-primary',
  disabled = false,
  buttonType = 'button',
  size = 'sm',
  style = null,
  onClick = null,
  smaller = false,
  children = null,
}) => {
  const commonButtonStyle = {
    margin: '0.25rem',
  }
  const extraSmallButtonStyle = {
    ...commonButtonStyle,
    padding: '0rem 0.25rem',
    fontSize: '0.75rem',
  }

  return (
    <Button
      disabled={disabled ?? undefined}
      onClick={onClick ?? undefined}
      size={(size === 'extra-sm' ? 'sm' : size) ?? undefined}
      type={buttonType ?? undefined}
      variant={variant ?? undefined}
      style={{
        ...(smaller || size === 'extra-sm' ? extraSmallButtonStyle : commonButtonStyle),
        ...(style || {}),
      }}
    >
      {children}
    </Button>
  )
}

export const PHIconOverlayButton: React.FC<PHButtonProps & { icon: string; label: string; iconSize?: number }> = (
  props
) => {
  const onOverlay: OverlayChildren = (p) => (
    <Tooltip {...p}>
      <div style={{ width: 'max-content' }}>{props.label}</div>
    </Tooltip>
  )
  return (
    <OverlayTrigger placement="bottom" overlay={onOverlay}>
      <div style={{ display: 'inline-block' }}>
        <PHButton {...props} style={{ margin: 0, padding: 0 }}>
          <Icon path={props.icon} size={props.iconSize ?? 0.6} />
        </PHButton>
      </div>
    </OverlayTrigger>
  )
}

export { PHButton }
