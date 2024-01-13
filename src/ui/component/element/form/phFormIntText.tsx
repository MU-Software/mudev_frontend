import React from 'react'
import { Form } from 'react-bootstrap'

export const PHFormIntOnlyText: React.FC<{
  label: string
  placeholder?: string
  disabled: boolean
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}> = ({ label, placeholder, disabled, value, onChange }) => (
  <Form.Group>
    <Form.Label>{label}</Form.Label>
    <Form.Control
      required
      autoCapitalize="off"
      autoCorrect="off"
      autoComplete="off"
      autoFocus
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      title="숫자만 입력 가능합니다."
      placeholder={placeholder}
      disabled={disabled}
      value={value}
      onChange={onChange}
    />
    <br />
  </Form.Group>
)
