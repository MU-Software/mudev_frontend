import React from 'react';
import { Form } from 'react-bootstrap';

export type PHFormSelectOptionElementType = {
  value: string;
  label: string;
  disabled?: boolean;
};
export type PHFormSelectOptionType = { [key: string]: PHFormSelectOptionElementType; };

export const PHFormSelect: React.FC<{
  disabled: boolean;
  selectableValues: PHFormSelectOptionType;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  style?: React.CSSProperties;
  value?: string;
  inputRef?: React.RefObject<HTMLSelectElement>;
}> = ({ disabled, selectableValues, style, value, inputRef, onChange }) => {
  const options = Object.entries(selectableValues).map(([key, value], index) => (
    <option key={`select-option-${index}`} value={value.value} disabled={value.disabled}>{value.label}</option>
  ));
  return <Form.Select
    value={value}
    ref={inputRef}
    disabled={disabled}
    style={style}
    onChange={onChange}
  >
    {options}
  </Form.Select>;
};
